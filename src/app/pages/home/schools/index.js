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
    TablePagination,
} from "@material-ui/core";

import firebase from '../../../services/firebase';

import SchoolDetail from './SchoolDetail';
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
    { id: "sc_index", numeric: false, disablePadding: false, label: "No" },
    { id: "sc_name", numeric: false, disablePadding: false, label: "School Name" },
    { id: "sc_photo", numeric: false, disablePadding: false, label: "Photo" },
    { id: "sc_number", numeric: false, disablePadding: false, label: "Number" },
    { id: "sc_levels", numeric: false, disablePadding: false, label: "Levels" },
    { id: "sc_classes", numeric: false, disablePadding: false, label: "Classes" },
    { id: "sc_students", numeric: false, disablePadding: false, label: "Students" },
    { id: "sc_teachers", numeric: false, disablePadding: false, label: "Teachers" },
    { id: "sc_public", numeric: false, disablePadding: false, label: "Public" }
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

var all_schools = [];

export default function Schools() {
    // Example 3
    const classes3 = useStyles3();
    const [order3, setOrder3] = React.useState("desc");
    const [orderBy3, setOrderBy3] = React.useState("emailVerified");

    const [selectedRowId] = React.useState('');

    const [page3, setPage3] = React.useState(0);
    const [dense3] = React.useState(false);
    const [rowsPerPage3, setRowsPerPage3] = React.useState(5);
    const [rows, setRows] = React.useState([]);

    const [showModalOpen, setModalOpen] = React.useState(false);
    const [modalInitialValues, setModalInitialValues] = React.useState({});

    function setModalOpenToClose() {
        getSchoolList();
        setModalOpen(false);
    }

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

    function getSchoolList() {
        var schools_arr = [];
        firebase.database().ref('schools').on('value', function (snapshot) {
            if (snapshot.numChildren() !== 0) {
                var index = 0;
                snapshot.forEach(function (childSnapshot) {
                    index++;
                    var school_uid = childSnapshot.val().uid;
                    schools_arr.push(childSnapshot.val());
                    firebase.database().ref('users').orderByKey().equalTo(school_uid).on('value', function (snapshot1) {
                        schools_arr[schools_arr.length - 1].name = snapshot1.val()[school_uid].name;
                        schools_arr[schools_arr.length - 1].photo = snapshot1.val()[school_uid].photo;
                        schools_arr[schools_arr.length - 1].email = snapshot1.val()[school_uid].email;
                        if (index === schools_arr.length) {
                            all_schools = schools_arr;
                            setRows(all_schools);
                        }
                    });
                });
            }
        });
    }

    function handleSchoolDetail(school_uid) {
        var selected_school = all_schools.filter(item => item.uid == school_uid);
        setModalInitialValues({
            data: selected_school
        });
        setModalOpen(true);
    }

    useEffect(() => {
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
                                    <Typography variant="h6" id="tableTitle"><i className="flaticon-buildings"></i> Schools </Typography>
                                </div>

                                <div className={classesToolbar.spacer} />
                            </Toolbar>

                            <div className={classes3.tableWrapper}>
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
                                                const isItemSelected = selectedRowId === row.uid;
                                                const labelId = `enhanced-table-checkbox-${index}`;

                                                return (
                                                    <TableRow
                                                        hover
                                                        onClick={event => handleSchoolDetail(row.uid)}
                                                        tabIndex={-1}
                                                        key={row.uid}
                                                        selected={isItemSelected}
                                                    >
                                                        <TableCell component="th" id={labelId} scope="row">
                                                            {index + 1}
                                                        </TableCell>

                                                        <TableCell align="left"> {row.name} </TableCell>

                                                        <TableCell align="left"><img alt={row.name} width={40} src={row.photo} /></TableCell>

                                                        <TableCell align="left">{row.number}</TableCell>

                                                        <TableCell align="left">{row.levels.length}</TableCell>

                                                        <TableCell align="left">{row.classes.length}</TableCell>

                                                        <TableCell align="left">{row.students.length}</TableCell>

                                                        <TableCell align="left">{row.teachers.length}</TableCell>

                                                        <TableCell align="left">{(row.isPublic) ? 'TRUE' : 'FALSE'}</TableCell>
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
            {modalInitialValues.data !== undefined &&
                <SchoolDetail
                    open={showModalOpen}
                    onClose={setModalOpenToClose}
                    modalInitialValues={modalInitialValues} />
            }
        </>
    );
};