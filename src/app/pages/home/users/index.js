/* eslint-disable no-restricted-imports */
import React, { useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import {
    makeStyles,
    lighten,
} from "@material-ui/core/styles";
import {
    ButtonGroup,
    IconButton,
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
    Tooltip
} from "@material-ui/core";

import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

// import moment from 'moment';
// import instance from '../../../services/instance';
import firebase from '../../../services/firebase';

import UserForm from './UserForm';
import { customConfirm } from "../../../services";

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
    { id: "no", numeric: false, disablePadding: false, label: "No" },
    { id: "name", numeric: false, disablePadding: false, label: "Name" },
    { id: "photo", numeric: false, disablePadding: false, label: "Photo" },
    { id: "phone_number", numeric: false, disablePadding: false, label: "Phone Number" },
    { id: "user_type", numeric: false, disablePadding: false, label: "Type" },
    { id: "country", numeric: false, disablePadding: false, label: "Country" },
    { id: "city", numeric: false, disablePadding: false, label: "City" },
    { id: "status", numeric: false, disablePadding: false, label: "Status" },
    { id: "payed", numeric: false, disablePadding: false, label: "Payed(XOF)" }
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

var all_users;
var all_transactions = [];

export default function Users() {
    // Example 3
    const classes3 = useStyles3();
    const [order3, setOrder3] = React.useState("desc");
    const [orderBy3, setOrderBy3] = React.useState("emailVerified");

    const [selectedRowId, selectRow] = React.useState('');

    const [page3, setPage3] = React.useState(0);
    const [dense3] = React.useState(false);
    const [rowsPerPage3, setRowsPerPage3] = React.useState(5);
    const [rows, setRows] = React.useState([]);

    const [editModalOpen, setModalOpen] = React.useState(false);
    const [modalInitialValues, setModalInitialValues] = React.useState({});

    function setModalOpenToClose() {
        getUserList();
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

    function handleAddUser() {
        setModalInitialValues({
            uid: '',
            email: '',
            role: 'user'
        });
        setModalOpen(true);
    }

    function handleEditUserInfo() {
        firebase.database().ref('users').orderByChild('email').equalTo(selectedRowId).on('value', function (snapshot) {
            setModalInitialValues(snapshot.val());
            setModalOpen(true);
        })
    }

    function handleDeleteUserInfo() {
        customConfirm({
            title: "Do you really wanna delete this user ?",
            okLabel: "Delete",
            autoClose: false
        }, (confirmId) => {
            // instance.delete("users/" + selectedRowId)
            //     .then(res => {
            //         customConfirmClose(confirmId);
            //         CustomSnackbar.success("Successfully deleted a user");
            //     });
        });
    }

    function getUserList() {
        var users_arr = [];
        all_transactions = [];
        firebase.database().ref('users').on('value', function (snapshot) {
            if (snapshot.numChildren() !== 0) {
                snapshot.forEach(function (childSnapshot) {
                    if (!(childSnapshot.val().type === "ADMIN" || childSnapshot.val().type === "SCHOOL")) {
                        users_arr.push(childSnapshot.val());
                        users_arr[users_arr.length - 1].key = childSnapshot.key;
                        if (childSnapshot.val().type === "STUDENT")
                            firebase.database().ref('transactions').orderByChild("student_id").equalTo(childSnapshot.key).on('value', function (snapshot1) {
                                if (snapshot1.numChildren() !== 0) {
                                    var payed_value = 0;
                                    var index = 0;
                                    snapshot1.forEach(function (item) {
                                        if (item.val().status === "200")
                                            payed_value += Number(item.val().amount);
                                        if (index === snapshot1.numChildren() - 1) {
                                            all_transactions.push({ uid: childSnapshot.key, payed_value: payed_value })
                                        }
                                        index++;
                                    });
                                } else {

                                }
                            });
                    }
                });
                all_users = users_arr;
                setRows(all_users);
            }
        });
    }

    function getPayedValue(key) {
        var user_payed = all_transactions.filter(item => item.uid === key);
        return (user_payed[0] === undefined)?"":user_payed[0].payed_value;
    }

    function filterUsers(event) {
        const type = event.target.value;
        if (type === "Teacher") {
            const teachers = all_users.filter(user => user.type === "TEACHER");
            setRows(teachers);
        } else if (type === "Student") {
            const students = all_users.filter(user => user.type === "STUDENT");
            setRows(students);

        } else if (type === "Parent") {
            const parents = all_users.filter(user => user.type === "PARENT");
            setRows(parents);
        } else {
            setRows(all_users);
        }
    }

    useEffect(() => {
        getUserList();
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
                                    <Typography variant="h6" id="tableTitle"><i className="flaticon2-avatar"></i> Users </Typography>
                                </div>

                                <div className={classesToolbar.spacer} />

                                <div className={classesToolbar.actions}>
                                    {Boolean(selectedRowId) ? (
                                        <ButtonGroup>
                                            <Tooltip title="Add">
                                                <IconButton aria-label="Add" onClick={handleAddUser}>
                                                    <AddIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton aria-label="Edit" onClick={handleEditUserInfo}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton aria-label="Delete" onClick={handleDeleteUserInfo}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </ButtonGroup>
                                    ) : (
                                            <Tooltip title="Add">
                                                <IconButton aria-label="Add" onClick={handleAddUser}>
                                                    <AddIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                </div>
                            </Toolbar>

                            <div className={classes3.tableWrapper}>
                                <div style={{ margin: " 10px 0px 10px 83.33%" }} className="col-md-2">
                                    <select
                                        className="form-control"
                                        name="user-type"
                                        // onBlur={handleBlur}
                                        // value={get(values, "brand.self.skin")}
                                        onChange={filterUsers}
                                    >
                                        <option value="all">All</option>
                                        <option value="Teacher">Teachers</option>
                                        <option value="Student">Students</option>
                                        <option value="Parent">Parents</option>
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
                                                const isItemSelected = selectedRowId === row.email;
                                                const labelId = `enhanced-table-checkbox-${index}`;

                                                return (
                                                    <TableRow
                                                        hover
                                                        // role="checkbox"
                                                        // aria-checked={isItemSelected}
                                                        tabIndex={-1}
                                                        key={row.email}
                                                        selected={isItemSelected}
                                                    >
                                                        {/* <TableCell padding="checkbox">
                                                            <Checkbox
                                                                checked={isItemSelected}
                                                                inputProps={{
                                                                    "aria-labelledby": labelId
                                                                }}
                                                            />
                                                        </TableCell> */}

                                                        <TableCell component="th" id={labelId} scope="row">
                                                            {index + 1}
                                                        </TableCell>

                                                        <TableCell align="left"> {row.name} </TableCell>

                                                        <TableCell align="left"><img alt={row.name} width={40} src={row.photo} /></TableCell>

                                                        <TableCell align="left">{row.phone}</TableCell>

                                                        <TableCell align="left">{row.type}</TableCell>

                                                        <TableCell align="left">{row.country}</TableCell>

                                                        <TableCell align="left">{row.city}</TableCell>

                                                        <TableCell align="left">{(row.status === 1) ? 'Registered' : 'Not yet'}</TableCell>

                                                        <TableCell align="left">{getPayedValue(row.key)}</TableCell>
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

            <UserForm
                open={editModalOpen}
                onClose={setModalOpenToClose}
                modalInitialValues={modalInitialValues} />
        </>
    );
};