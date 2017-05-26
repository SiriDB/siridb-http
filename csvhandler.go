package main

import (
	"encoding/csv"
	"fmt"
	"io"
	"reflect"
	"strconv"
	"strings"
)

func toCsvVal(s string) string {
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
		return queryToCsv(v)
	default:
		return "", fmt.Errorf("unexpected data type: %s", t.Kind())
	}
}

func queryToCsv(v interface{}) (string, error) {
	m, ok := v.(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("got an unexpected map")
	}
	if columns, ok := m["columns"]; ok {
		fmt.Println(columns)
	}
	return "mapje", nil
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
			arr[i-1] = append(arr[i-1], [2]interface{}{ts, parseCsvVal(record[i])})
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
