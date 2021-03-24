import React from 'react';
import PropTypes from 'prop-types';


const Table = ({columns, data, formatters, hideHeader}) => {
    const fmtFuns = columns.map((column) => formatters[column] || ((val) => val));

    return (
        <table className="table table-striped table-condensed table-result">
            <thead>
                <tr hidden={hideHeader}>
                    {
                        columns.map((column, n) => (
                            <th
                                key={n}
                                style={column==='time' ? {width: 200} : null}
                            >
                                {column}
                            </th>
                        ))
                    }
                </tr>
            </thead>

            <tbody>
                {
                    data.map((row, r) => (
                        <tr key={r}>
                            {
                                row.map((val, n) => (
                                    <td key={n}>
                                        {fmtFuns[n](val)}
                                    </td>
                                ))
                            }
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
};

Table.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.string).isRequired,
    data: PropTypes.arrayOf(PropTypes.array).isRequired,
    formatters: PropTypes.objectOf(PropTypes.func),
    hideHeader: PropTypes.bool,
};

Table.defaultProps = {
    formatters: {},
    hideHeader: false
};

export default Table;