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

// import { CustomSnackbar, customConfirm, customConfirmClose } from "../../../services";

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
    { id: "ts_school", numeric: false, disablePadding: false, label: "School" },
    { id: "ts_presentor", numeric: false, disablePadding: false, label: "Presentor" },
    { id: "ts_title", numeric: false, disablePadding: false, label: "Title" },
    { id: "ts_description", numeric: false, disablePadding: false, label: "Description" },
    { id: "ts_category", numeric: false, disablePadding: false, label: "Category" },
    { id: "ts_public", numeric: false, disablePadding: false, label: "Public" },
    { id: "ts_allow", numeric: false, disablePadding: false, label: "Allow" },
    { id: "ts_url", numeric: false, disablePadding: false, label: "Show" }
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

var all_books_info = {};
var all_schools = [];

export default function Library() {
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

    function getBookList() {
        var books_arr = [];
        firebase.database().ref('library').on('value', function (snapshot) {
            if (snapshot.numChildren() !== 0) {
                var index = 0;
                snapshot.forEach(function (childSnapshot) {
                    books_arr.push(childSnapshot.val());
                    var school_id = childSnapshot.val().school_id;
                    var presentor_id = childSnapshot.val().uid;
                    books_arr[index].key = childSnapshot.val().key;
                    // get presentor name
                    firebase.database().ref("users").orderByKey().equalTo(presentor_id).on('value', function (childSnapshot1) {
                        if (index === snapshot.numChildren()) {
                            books_arr[index - 1].presentor_name = childSnapshot1.val()[presentor_id].name;
                            if (books_arr[index - 1].school_name !== undefined) {
                                all_books_info = books_arr;
                                setRows(all_books_info);
                            }
                        } else {
                            books_arr[index].presentor_name = childSnapshot1.val()[presentor_id].name;
                        }
                    });

                    // get school name
                    firebase.database().ref('schools').orderByKey().equalTo(school_id).on('value', function (snapshot1) {
                        var school_uid = snapshot1.val()[school_id].uid;
                        firebase.database().ref('users').orderByKey().equalTo(school_uid).on('value', function (childSnapshot1) {
                            if (index === snapshot.numChildren()) {
                                books_arr[index - 1].school_name = childSnapshot1.val()[school_uid].name;
                                if (books_arr[index - 1].presentor_name !== undefined) {
                                    all_books_info = books_arr;
                                    setRows(all_books_info);
                                }
                            } else {
                                books_arr[index].school_name = childSnapshot1.val()[school_uid].name;
                                index++;
                                if (index === snapshot.numChildren()) {
                                    all_books_info = books_arr;
                                    setRows(all_books_info);
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
            setRows(all_books_info)
        } else {
            var filtered_info = all_books_info.filter(item => item.school_id === school_id);
            setRows(filtered_info);
        }
    }

    useEffect(() => {
        getBookList();
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
                                    <Typography variant="h6" id="tableTitle"><i className="flaticon-book"></i> Library </Typography>
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
                                                const isItemSelected = selectedRowId === index;
                                                const labelId = `enhanced-table-checkbox-${index}`;

                                                return (
                                                    <TableRow
                                                        hover
                                                        tabIndex={-1}
                                                        key={index}
                                                        selected={isItemSelected}
                                                    >
                                                        <TableCell component="th" id={labelId} scope="row">
                                                            {index + 1}
                                                        </TableCell>

                                                        <TableCell align="left">{row.school_name}</TableCell>

                                                        <TableCell align="left">{row.presentor_name}</TableCell>

                                                        <TableCell align="left">{row.title}</TableCell>

                                                        <TableCell align="left">{row.description}</TableCell>

                                                        <TableCell align="left">{row.category}</TableCell>

                                                        <TableCell align="left">{(row.isPublic) ? "TRUE" : "FALSE"}</TableCell>

                                                        <TableCell align="left">{(row.isAllow) ? "TRUE" : "FALSE"}</TableCell>
                                                        <TableCell align="left"><a href={row.url} target="blank">link</a></TableCell>
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