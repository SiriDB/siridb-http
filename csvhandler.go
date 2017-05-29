package main

import (
	"encoding/csv"
	"fmt"
	"io"
	"reflect"
	"strconv"
	"strings"
)

func escapeCsv(s string) string {
	if strings.ContainsRune(s, '"') {
		return fmt.Sprintf("\"%s\"", strings.Replace(s, `"`, `""`, -1))
	}
	if strings.ContainsRune(s, ',') {
		return fmt.Sprintf("\"%s\"", s)
	}
	return s
}

func toCsv(v interface{}) (string, error) {
	t := reflect.TypeOf(v)
	switch t.Kind() {
	case reflect.Struct:
		m := reflect.ValueOf(v)
		n := m.NumField()
		lines := make([]string, n)
		for i := 0; i < n; i++ {
			field := t.Field(i)
			fn := field.Tag.Get("csv")
			if len(fn) == 0 {
				fn = field.Name
			}

			val := m.Field(i)
			lines[i] = fmt.Sprintf("%s,%s", fn, val.String())
		}
		return strings.Join(lines, "\n"), nil
	case reflect.Map:
		var lines []string
		if err := queryToCsv(&lines, v); err != nil {
			return "", err
		}
		return strings.Join(lines, "\n"), nil
	default:
		return "", fmt.Errorf("unexpected data type: %s", t.Kind())
	}
}

func queryToCsv(lines *[]string, v interface{}) error {
	m, ok := v.(map[string]interface{})
	if !ok {
		return fmt.Errorf("got an unexpected map")
	}

	if err := tryTimeIt(lines, m); err != nil {
		return err
	}

	if stop, err := tryList(lines, m); stop {
		return err
	}

	if stop, err := tryCount(lines, m); stop {
		return err
	}

	if stop, err := tryShow(lines, m); stop {
		return err
	}

	if stop, err := tryMsg(lines, m); stop {
		return err
	}

	if stop, err := trySelect(lines, m); stop {
		return err
	}

	return fmt.Errorf("cannot convert query data to csv")
}

func tryTimeIt(lines *[]string, m map[string]interface{}) error {
	if timeit, ok := m["__timeit__"]; ok {
		*lines = append(*lines, "server name,query time")

		if reflect.TypeOf(timeit).Kind() != reflect.Slice {
			return fmt.Errorf("timeit: __timeit__ not a slice")
		}

		slice := reflect.ValueOf(timeit)
		n := slice.Len()
		for i := 0; i < n; i++ {
			res := slice.Index(i).Interface()
			resmap, ok := res.(map[string]interface{})
			if !ok {
				return fmt.Errorf("timeit: no map")
			}
			server, ok := resmap["server"]
			if !ok {
				return fmt.Errorf("timeit: no server")
			}
			time, ok := resmap["time"]
			if !ok {
				return fmt.Errorf("timeit: no time")
			}
			*lines = append(*lines, fmt.Sprintf(
				"%s,%s",
				escapeCsv(fmt.Sprint(server)),
				escapeCsv(fmt.Sprint(time))))
		}
		*lines = append(*lines, "")

		delete(m, "__timeit__")
	}
	return nil
}

func trySelect(lines *[]string, m map[string]interface{}) (bool, error) {
	for sn, pnts := range m {

		if reflect.TypeOf(pnts).Kind() != reflect.Slice {
			return false, fmt.Errorf("select: points not a slice")
		}

		points := reflect.ValueOf(pnts)
		n := points.Len()
		for i := 0; i < n; i++ {
			pnt := points.Index(i).Interface()
			if reflect.TypeOf(pnt).Kind() != reflect.Slice {
				return false, fmt.Errorf("select: point not a slice")
			}
			point := reflect.ValueOf(pnt)
			if point.Len() != 2 {
				return false, fmt.Errorf("select: point should be of len 2")
			}
			*lines = append(*lines, fmt.Sprintf(
				`%s,%v,%s`,
				escapeCsv(sn),
				point.Index(0),
				escapeCsv(fmt.Sprint(point.Index(1)))))
		}
	}
	return true, nil
}

func tryMsg(lines *[]string, m map[string]interface{}) (bool, error) {
	options := [4]string{
		"success_msg",
		"error_msg",
		"help",
		"motd"}
	for _, option := range options {
		if message, ok := m[option]; ok {
			msg, ok := message.(string)
			if ok {
				*lines = append(*lines, fmt.Sprintf(`%s,%s`, option, escapeCsv(msg)))
				return true, nil
			}
		}
	}
	return false, fmt.Errorf("no message found")
}

func tryShow(lines *[]string, m map[string]interface{}) (bool, error) {
	var data, name, value interface{}
	var item map[string]interface{}
	var ok bool

	if data, ok = m["data"]; !ok {
		return false, fmt.Errorf("show: data not found")
	}

	if reflect.TypeOf(data).Kind() != reflect.Slice {
		return false, fmt.Errorf("show: data not a slice")
	}

	slice := reflect.ValueOf(data)
	n := slice.Len()
	if n == 0 {
		return false, fmt.Errorf("zero data items found")
	}

	var temp = make([]string, n)
	for i := 0; i < n; i++ {
		v := slice.Index(i).Interface()
		if item, ok = v.(map[string]interface{}); !ok {
			return false, fmt.Errorf("show: data contains a type other than map")
		}
		if name, ok = item["name"]; !ok {
			return false, fmt.Errorf("show: name not fount in item")
		}

		if value, ok = item["value"]; !ok {
			return false, fmt.Errorf("show: value not fount in item")
		}

		temp[i] = fmt.Sprintf(`%v,%s`, name, escapeCsv(fmt.Sprint(value)))
	}
	for i := 0; i < n; i++ {
		*lines = append(*lines, temp[i])
	}
	return true, nil
}

func tryCount(lines *[]string, m map[string]interface{}) (bool, error) {
	cols := [10]string{
		"calc",
		"series",
		"servers",
		"groups",
		"shards",
		"pools",
		"users",
		"servers_received_points",
		"series_length",
		"shards_size"}
	for _, col := range cols {
		if count, ok := m[col]; ok {
			i, ok := count.(int)
			if ok {
				*lines = append(*lines, fmt.Sprintf(`%s,%d`, col, i))
				return true, nil
			}
		}
	}
	return false, fmt.Errorf("no counter key found")
}

func tryList(lines *[]string, m map[string]interface{}) (bool, error) {
	var columns interface{}
	var ok bool
	if columns, ok = m["columns"]; !ok {
		return false, fmt.Errorf("columns not found")
	}

	if reflect.TypeOf(columns).Kind() != reflect.Slice {
		return false, fmt.Errorf("columns not a slice")
	}

	slice := reflect.ValueOf(columns)
	n := slice.Len()
	if n == 0 {
		return false, fmt.Errorf("zero comuns found")
	}

	var temp = make([]string, n)
	for i := 0; i < n; i++ {
		v := slice.Index(i).Interface()
		if s, ok := v.(string); ok {
			temp[i] = escapeCsv(s)
		} else {
			return false, fmt.Errorf("columns contains non string")
		}
	}
	*lines = append(*lines, strings.Join(temp, ","))

	delete(m, "columns")

	for k, data := range m {
		if reflect.TypeOf(data).Kind() != reflect.Slice {
			return true, fmt.Errorf("%s not a slice", k)
		}
		rows := reflect.ValueOf(data)
		nrows := rows.Len()
		for r := 0; r < nrows; r++ {
			row := rows.Index(r).Interface()

			if reflect.TypeOf(row).Kind() != reflect.Slice {
				return true, fmt.Errorf("row not a slice")
			}
			cols := reflect.ValueOf(row)

			ncols := cols.Len()
			if n != ncols {
				return true, fmt.Errorf("number of columns does not equel values")
			}
			var temp = make([]string, n)
			for i := 0; i < ncols; i++ {
				temp[i] = escapeCsv(fmt.Sprint(cols.Index(i).Interface()))
			}
			*lines = append(*lines, strings.Join(temp, ","))
		}
	}
	return true, nil
}

func parseCsv(r io.Reader) (map[string]interface{}, error) {

	data := make(map[string]interface{})
	reader := csv.NewReader(r)

	record, err := reader.Read()
	if err == io.EOF {
		return nil, fmt.Errorf("no csv data found")
	}
	if err != nil {
		return nil, err
	}
	if record[0] == "" {
		err = readTable(&data, record, reader)
	} else if len(record) == 3 {
		err = readFlat(&data, record, reader)
	} else if len(record) == 2 {
		err = readAPI(&data, record, reader)
	} else {
		err = fmt.Errorf("unknown csv layout received")
	}
	return data, err
}

func parseCsvVal(inp string) interface{} {
	if i, err := strconv.Atoi(inp); err == nil {
		return i
	}
	if f, err := strconv.ParseFloat(inp, 64); err == nil {
		return f
	}
	return inp
}

func readAPI(data *map[string]interface{}, record []string, reader *csv.Reader) error {
	if err := appendAPIRecord(data, record); err != nil {
		return err
	}
	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}
		if err := appendAPIRecord(data, record); err != nil {
			return err
		}
	}
	return nil
}

func appendAPIRecord(data *map[string]interface{}, record []string) error {
	if val, ok := (*data)[record[0]]; ok {
		return fmt.Errorf("duplicated value for '%s'", val)
	}
	(*data)[record[0]] = parseCsvVal(record[1])
	return nil
}

func readTable(data *map[string]interface{}, record []string, reader *csv.Reader) error {
	if len(record) < 2 {
		return fmt.Errorf("missing series in csv table")
	}

	arr := make([][][2]interface{}, len(record)-1)

	for n := 1; n < len(record); n++ {
		(*data)[record[n]] = &arr[n-1]
	}
	for n := 2; ; n++ {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}
		ts, err := strconv.ParseUint(record[0], 10, 64)
		if err != nil {
			return fmt.Errorf("expecting a time-stamp in column zero at line %d", n)
		}
		for i := 1; i < len(record); i++ {
			arr[i-1] = append(arr[i-1], [2]interface{}{ts, escapeCsv(record[i])})
		}
	}
	return nil
}

func readFlat(data *map[string]interface{}, record []string, reader *csv.Reader) error {
	appendFlatRecord(data, record, 1)
	for n := 2; ; n++ {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}
		if err := appendFlatRecord(data, record, n); err != nil {
			return err
		}

	}
	return nil
}

func appendFlatRecord(data *map[string]interface{}, record []string, n int) error {
	var points *[][2]interface{}
	p, ok := (*data)[record[0]]
	if ok {
		points = p.(*[][2]interface{})
	} else {
		newPoints := make([][2]interface{}, 0)
		(*data)[record[0]] = &newPoints
		points = &newPoints
	}
	ts, err := strconv.ParseUint(record[1], 10, 64)
	if err != nil {
		return fmt.Errorf("expecting a time-stamp in column one at line %d", n)
	}
	*points = append(*points, [2]interface{}{ts, parseCsvVal(record[2])})
	return nil
}
