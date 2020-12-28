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
    Modal,
    Button,
    Tooltip,
    Divider
} from "@material-ui/core";

import firebase from '../../../services/firebase';

// import UserForm from './SchoolForm';
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
    { id: "tw_index", numeric: false, disablePadding: false, label: "No" },
    { id: "tw_report", numeric: false, disablePadding: false, label: "Reports" },
    { id: "tw_media", numeric: false, disablePadding: false, label: "Media" },
    { id: "tw_description", numeric: false, disablePadding: false, label: "Description" },
    { id: "tw_poster", numeric: false, disablePadding: false, label: "Poster" },
    { id: "tw_date", numeric: false, disablePadding: false, label: "Post date" },
    { id: "tw_comments", numeric: false, disablePadding: false, label: "Comments" },
    { id: "tw_likes", numeric: false, disablePadding: false, label: "Likes" },
    { id: "tw_dislikes", numeric: false, disablePadding: false, label: "Dislikes" }
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

var all_tweets = [];
var selected_tweet_reports = [];
var selected_tweet_key = "";

export default function Tweets() {
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
    const [checkModalOpen, setCheckcModalOpen] = React.useState(false);

    function setModalOpenToClose() {
        getTweetList();
        setModalOpen(false);
    }

    function setCheckModalOpenToClose() {
        getTweetList();
        setCheckcModalOpen(false);
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

    function getTweetList() {
        var tweets_arr = [];
        firebase.database().ref('tweets').on('value', function (snapshot) {
            if (snapshot.numChildren() !== 0) {
                var index = 0;
                snapshot.forEach(function (childSnapshot) {
                    var tweet_uid = childSnapshot.val().uid;
                    tweets_arr.push(childSnapshot.val());
                    tweets_arr[tweets_arr.length - 1].key = childSnapshot.key;
                    firebase.database().ref('users').orderByKey().equalTo(tweet_uid).on('value', function (snapshot1) {
                        tweets_arr[tweets_arr.length - 1].name = snapshot1.val()[tweet_uid].name;
                        tweets_arr[tweets_arr.length - 1].email = snapshot1.val()[tweet_uid].email;
                    });

                    var tweet_key = childSnapshot.key;
                    firebase.database().ref('reports').orderByChild('tweet_id').equalTo(tweet_key).on('value', function (snapshot2) {
                        if (snapshot2.numChildren() !== 0) {
                            var reports_arr = [];
                            snapshot2.forEach(function (childSnapshot2) {
                                reports_arr.push(childSnapshot2.val())
                                if (reports_arr.length === snapshot2.numChildren())
                                    tweets_arr[tweets_arr.length - 1].reports = reports_arr
                            })
                        } else {
                            tweets_arr[tweets_arr.length - 1].reports = undefined;
                        }
                        if (index === tweets_arr.length-1) {
                            all_tweets = tweets_arr;
                            setRows(all_tweets);
                        }
                        index++;
                    });

                });
            }
        });
    }

    function deleteHandle(key) {
        selected_tweet_key = key;
        var selected_tweet = all_tweets.filter(item => item.key === key);
        selected_tweet_reports = selected_tweet[0].reports;
        setModalOpen(true);
    }

    function deleteTweetItem() {
        let isMounted = true;
        var ref = firebase.database().ref("tweets/" + selected_tweet_key);
        ref.remove().then(data => {
            if (isMounted) getTweetList();
        });
        setModalOpen(false);
        setCheckcModalOpen(true);
    }

    useEffect(() => {
        getTweetList();
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
                                                        tabIndex={-1}
                                                        key={index}
                                                        selected={isItemSelected}
                                                        className={row.reports !== undefined?"highlight-report":""}
                                                    >
                                                        <TableCell component="th" id={labelId} scope="row">
                                                            {index + 1}
                                                        </TableCell>

                                                        <TableCell align="center">
                                                            <Tooltip title="All reports" placement="top">
                                                                <b style={{fontSize:20, color:"red", cursor: "pointer"}} onClick={() => deleteHandle(row.key)}>{(row.reports === undefined) ? "" : row.reports.length}</b>
                                                            </Tooltip>
                                                        </TableCell>

                                                        <TableCell align="left"><img alt={row.description} width={150} src={row.media} /></TableCell>

                                                        <TableCell align="left">{row.description}</TableCell>

                                                        <TableCell align="left">{row.name}</TableCell>

                                                        <TableCell align="left">{row.date}</TableCell>

                                                        <TableCell align="left">{(row.comments) ? row.comments.length : 0}</TableCell>

                                                        <TableCell align="left">{row.like}</TableCell>

                                                        <TableCell align="left">{row.dislike}</TableCell>
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
                <Modal
                    aria-labelledby="add-modal-title"
                    aria-describedby="add-modal-description"
                    open={showModalOpen}
                    onClose={setModalOpenToClose}
                >
                    <div style={{
                        position: "absolute",
                        width: "700px",
                        backgroundColor: "white",
                        boxShadow: "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)",
                        padding: "0px",
                        outline: "none",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    }}>
                        <Typography variant="h3" id="modal-title" style={{ marginBottom: "10px" }} style={{ textAlign: "center", fontSize: "25px", borderRadius: "0px", color: "darkblue" }}>
                            All reports
                        </Typography>
                        <div style={{ padding: 20 }}>
                            {
                                selected_tweet_reports.map((item, index) => (
                                    <div style={{float:"left", width:"100%"}} key={index}>
                                        <p style={{ fontSize: 16, float:"left", color: "black", maxWidth:"150px", fontWeight:"bold" }}>{item.username} : </p>
                                        <p style={{ fontSize: 16, float:"left", marginLeft:"10px", color: "red", maxWidth:"500px" }}>{item.content}</p>
                                        { index !== selected_tweet_reports.length-1 &&
                                            <Divider/>
                                        }
                                    </div>
                                    ))
                            }
                        </div>
                        <div className="tweets-btn-group" style={{ float: "left", width: "100%", height: "30px", padding: "10px 5px", height: "51px", backgroundColor: "gainsboro" }}>
                            <Button className="btn btn-success" style={{ float: "right", marginLeft: "5px" }} onClick={setModalOpenToClose}>CANCEL</Button>
                            <Button className="btn btn-danger" style={{ float: "right" }} onClick={deleteTweetItem}>DELETE</Button>
                        </div>
                    </div>
                </Modal>
                <Modal
                    aria-labelledby="add-modal-title"
                    aria-describedby="add-modal-description"
                    open={checkModalOpen}
                    onClose={setCheckModalOpenToClose}
                >
                    <div style={{
                        position: "absolute",
                        width: "400px",
                        backgroundColor: "white",
                        boxShadow: "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)",
                        padding: "0px",
                        outline: "none",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    }}>
                        <Typography variant="h3" id="modal-title" style={{ marginBottom: "10px" }} style={{ textAlign: "left", fontSize: "30px", borderRadius: "0px", color: "darkblue" }}>
                            <i className="flaticon2-info"></i> Confirm
                        </Typography>
                        <div style={{ height: 120, padding: 20, textAlign: "center" }}>
                            <h3>Succefully Deleted!</h3>
                        </div>
                        <div className="tweets-btn-group" style={{ float: "left", width: "100%", height: "30px", padding: "10px 5px", height: "51px", backgroundColor: "gainsboro" }}>
                            <Button className="btn btn-danger" style={{ float: "right", marginLeft: "5px" }} onClick={setCheckModalOpenToClose}>CANCEL</Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </>
    );
};