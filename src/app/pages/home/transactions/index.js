/* eslint-disable no-restricted-imports */
import React, { useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import {
    makeStyles,
    lighten,
} from "@material-ui/core/styles";
import {
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Toolbar,
    Typography,
    TableSortLabel,
    TablePagination
} from "@material-ui/core";

import firebase from '../../../services/firebase';

// Example 3
function desc3(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function stableSort3(array, cmp) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = cmp(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
    return order === "desc"
        ? (a, b) => desc3(a, b, orderBy)
        : (a, b) => -desc3(a, b, orderBy);
}

const headRows3 = [
    { id: "ts_index", numeric: false, disablePadding: false, label: "No" },
    { id: "ts_student", numeric: false, disablePadding: false, label: "Student" },
    { id: "ts_school", numeric: false, disablePadding: false, label: "School" },
    { id: "ts_parent", numeric: false, disablePadding: false, label: "Parent" },
    { id: "ts_amount", numeric: false, disablePadding: false, label: "Amount" },
    { id: "ts_date", numeric: false, disablePadding: false, label: "Date" },
    { id: "ts_method", numeric: false, disablePadding: false, label: "Method" },
    { id: "ts_status", numeric: false, disablePadding: false, label: "Status" },
    { id: "ts_link", numeric: false, disablePadding: false, label: "Payment Link" }
];

function EnhancedTableHead3(props) {
    const {
        order,
        orderBy,
        onRequestSort
    } = props;
    const createSortHandler = property => event => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                {headRows3.map(row => (
                    <TableCell
                        key={row.id}
                        align={row.numeric ? "right" : "left"}
                        padding={row.disablePadding ? "none" : "default"}
                        sortDirection={orderBy === row.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === row.id}
                            direction={order}
                            onClick={createSortHandler(row.id)}
                        >
                            {row.label}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead3.propTypes = {
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired
};

const useToolbarStyles3 = makeStyles(theme => ({
    root: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(1)
    },
    highlight:
        theme.palette.type === "light"
            ? {
                color: theme.palette.secondary.main,
                backgroundColor: lighten(theme.palette.secondary.light, 0.85)
            }
            : {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.secondary.dark
            },
    spacer: {
        flex: "1 1 100%"
    },
    actions: {
        color: theme.palette.text.secondary
    },
    title: {
        flex: "0 0 auto"
    }
}));

const useStyles3 = makeStyles(theme => ({
    root: {
        width: "100%",
        marginTop: theme.spacing(3)
    },
    paper: {
        width: "100%",
        marginBottom: theme.spacing(2)
    },
    table: {
        minWidth: 750
    },
    tableWrapper: {
        overflowX: "auto"
    }
}));

var all_transactions_info = [];
var all_schools = [];

export default function Transactions() {
    // Example 3
    const classes3 = useStyles3();
    const [order3, setOrder3] = React.useState("desc");
    const [orderBy3, setOrderBy3] = React.useState("emailVerified");

    const [selectedRowId] = React.useState('');

    const [page3, setPage3] = React.useState(0);
    const [dense3] = React.useState(false);
    const [rowsPerPage3, setRowsPerPage3] = React.useState(5);
    const [rows, setRows] = React.useState([]);
    const [options, setOptions] = React.useState([]);

    function handleRequestSort3(event, property) {
        const isDesc = orderBy3 === property && order3 === "desc";
        setOrder3(isDesc ? "asc" : "desc");
        setOrderBy3(property);
    }

    function handleChangePage3(event, newPage) {
        setPage3(newPage);
    }

    function handleChangeRowsPerPage3(event) {
        setRowsPerPage3(+event.target.value);
    }

    const emptyRows3 =
        rowsPerPage3 - Math.min(rowsPerPage3, rows.length - page3 * rowsPerPage3);

    function getTransactionList() {
        var transactions_arr = [];
        firebase.database().ref('transactions').on('value', function (snapshot) {
            if (snapshot.numChildren() !== 0) {
                var index = 0;
                snapshot.forEach(function (childSnapshot) {
                    transactions_arr.push(childSnapshot.val());
                    var student_id = childSnapshot.val().student_id;
                    var parent_id = childSnapshot.val().parent_id;
                    var transaction_schoolId = childSnapshot.val().school_id;

                    // get user student name
                    firebase.database().ref("users").orderByKey().equalTo(student_id).on('value', function (childSnapshot1) {
                        if (index === snapshot.numChildren()) {
                            transactions_arr[index - 1].student_name = childSnapshot1.val()[student_id].name;
                            if (transactions_arr[index - 1].parent_name !== undefined && transactions_arr[index - 1].school_name !== undefined) {
                                all_transactions_info = transactions_arr;
                                setRows(all_transactions_info);
                            }
                        } else {
                            transactions_arr[index].student_name = childSnapshot1.val()[student_id].name;
                        }
                    });

                    // get parent name
                    firebase.database().ref("users").orderByKey().equalTo(parent_id).on('value', function (childSnapshot1) {
                        if (index === snapshot.numChildren()) {
                            transactions_arr[index - 1].parent_name = childSnapshot1.val()[parent_id].name;
                            if (transactions_arr[index - 1].student_name !== undefined && transactions_arr[index - 1].school_name !== undefined) {
                                all_transactions_info = transactions_arr;
                                setRows(all_transactions_info);
                            }
                        } else {
                            transactions_arr[index].parent_name = childSnapshot1.val()[parent_id].name;
                        }
                    })
                    // get school name
                    firebase.database().ref('schools').orderByKey().equalTo(transaction_schoolId).on('value', function (snapshot1) {
                        var school_uid = snapshot1.val()[transaction_schoolId].uid;
                        firebase.database().ref('users').orderByKey().equalTo(school_uid).on('value', function (childSnapshot1) {
                            if (index === snapshot.numChildren()) {
                                transactions_arr[index - 1].school_name = childSnapshot1.val()[school_uid].name;
                                if (transactions_arr[index - 1].student_name !== undefined && transactions_arr[index - 1].parent_name !== undefined) {
                                    all_transactions_info = transactions_arr;
                                    setRows(all_transactions_info);
                                }
                            } else {
                                transactions_arr[index].school_name = childSnapshot1.val()[school_uid].name;
                                index++;
                                if (index === snapshot.numChildren()) {
                                    all_transactions_info = transactions_arr;
                                    setRows(all_transactions_info);
                                }
                            }
                        })
                    });
                });
            }
        });
    }

    function getSchoolList() {
        firebase.database().ref('schools').on('value', function (snapshot) {
            if (snapshot.numChildren() !== 0) {
                var index = 0;
                snapshot.forEach(function (childSnapshot) {
                    all_schools = [];
                    index++;
                    var school_uid = childSnapshot.val().uid;
                    firebase.database().ref('users').orderByKey().equalTo(school_uid).on('value', function (snapshot1) {
                        all_schools.push({school_id:childSnapshot.key, name:snapshot1.val()[school_uid].name});
                        if(index === snapshot.numChildren())
                            setOptions(all_schools)
                    });
                });
            }
        });
    }

    function filterSchools(event) {
        var school_id = event.target.value;
    
        if(school_id === "all") {
            setRows(all_transactions_info)
        } else {
            var filtered_info = all_transactions_info.filter(item => item.school_id === school_id);
            setRows(filtered_info);
        }
    }

    useEffect(() => {
        getTransactionList();
        getSchoolList();
    }, []);


    const classesToolbar = useToolbarStyles3();
    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <div className={classes3.root}>
                        <Paper className={classes3.paper}>
                            <Toolbar
                                className={clsx(classesToolbar.root, {
                                    [classesToolbar.highlight]: true
                                })}
                            >
                                <div className={classesToolbar.title}>
                                    <Typography variant="h6" id="tableTitle"><i className="flaticon2-document"></i> Transactions </Typography>
                                </div>

                                <div className={classesToolbar.spacer} />
                            </Toolbar>

                            <div className={classes3.tableWrapper}>
                                <div style={{ margin: " 10px 0px 10px 83.33%" }} className="col-md-2">
                                    <select
                                        className="form-control"
                                        name="user-type"
                                        // onBlur={handleBlur}
                                        // value={get(values, "brand.self.skin")}
                                        onChange={filterSchools}
                                    >
                                        <option value="all">All</option>
                                        {
                                            options.map(item => (
                                                <option key={item.school_id} value={item.school_id}> {item.name} </option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <Table
                                    className={classes3.table}
                                    aria-labelledby="tableTitle"
                                    size={dense3 ? "small" : "medium"}
                                >
                                    <EnhancedTableHead3
                                        order={order3}
                                        orderBy={orderBy3}
                                        onRequestSort={handleRequestSort3}
                                    />
                                    <TableBody>
                                        {stableSort3(rows, getSorting(order3, orderBy3))
                                            .slice(
                                                page3 * rowsPerPage3,
                                                page3 * rowsPerPage3 + rowsPerPage3
                                            )
                                            .map((row, index) => {
                                                const isItemSelected = selectedRowId === row.transactionid;
                                                const labelId = `enhanced-table-checkbox-${index}`;

                                                return (
                                                    <TableRow
                                                        hover
                                                        tabIndex={-1}
                                                        key={row.transactionid}
                                                        selected={isItemSelected}
                                                    >
                                                        <TableCell component="th" id={labelId} scope="row">
                                                            {index + 1}
                                                        </TableCell>

                                                        <TableCell align="left">{row.student_name}</TableCell>

                                                        <TableCell align="left">{row.school_name}</TableCell>

                                                        <TableCell align="left">{row.parent_name}</TableCell>

                                                        <TableCell align="left">{row.amount}</TableCell>

                                                        <TableCell align="left">{row.date}</TableCell>

                                                        <TableCell align="left">{row.method}</TableCell>

                                                        <TableCell align="left">{(row.status === "200") ? "Performed" : "Queued"}</TableCell>

                                                        <TableCell align="left"><a href={row.pay_link} target="blank">link</a></TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        {emptyRows3 > 0 && (
                                            <TableRow style={{ height: 49 * emptyRows3 }}>
                                                <TableCell colSpan={6} />
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={rows.length}
                                rowsPerPage={rowsPerPage3}
                                page={page3}
                                backIconButtonProps={{
                                    "aria-label": "Previous Page"
                                }}
                                nextIconButtonProps={{
                                    "aria-label": "Next Page"
                                }}
                                onChangePage={handleChangePage3}
                                onChangeRowsPerPage={handleChangeRowsPerPage3}
                            />
                        </Paper>
                    </div>
                </div>
            </div>
        </>
    );
};