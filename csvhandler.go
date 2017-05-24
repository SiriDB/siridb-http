package main

import (
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"strings"
)

func csvRead(r *io.Reader) (map[string]interface{}, error) {
	in := `first_name,last_name,username
"Pike",rob,,
Ken,Thompson,ken
"Robert","Griesemer",4
`
	data := make(map[string]interface{})
	reader := csv.NewReader(strings.NewReader(in))

	record, err := reader.Read()
	if err == io.EOF {
		return nil, fmt.Errorf("no csv data found")
	}

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatal(err)
		}

		fmt.Println(record)
	}

	return data, err
}
