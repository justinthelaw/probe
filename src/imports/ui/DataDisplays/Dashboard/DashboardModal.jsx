import React, { useState, useEffect, useContext } from "react";
// Imports
import { useLocation } from "react-router-dom";
import { useHistory } from "react-router";
import { useTracker } from "meteor/react-meteor-data";
import { SchemaCollection } from "../../api/schemas";
import { SatelliteCollection } from "../../api/satellites";
import HelpersContext from "../Dialogs/HelpersContext.jsx";
import {
  emptyDataRemover,
  satelliteValidatorShaper,
} from "../utils/satelliteDataFuncs.js";
import ProtectedFunctionality from "../utils/ProtectedFunctionality.jsx";

// Components
import { Formik, Form } from "formik";
import { SatelliteForm } from "./SatelliteForm";
import AlertDialog from "../Dialogs/AlertDialog.jsx";
import SnackBar from "../Dialogs/SnackBar.jsx";
import { Gallery } from "../DataDisplays/Gallery.jsx";

// @material-ui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  makeStyles,
  Typography,
} from "@material-ui/core";
import Delete from "@material-ui/icons/Delete";
import Edit from "@material-ui/icons/Edit";
import Save from "@material-ui/icons/Save";
import Close from "@material-ui/icons/Close";

const useStyles = makeStyles(() => ({
  modal: {
    width: "auto",
    height: "auto",
  },
  title: {
    marginBottom: -5,
    marginTop: 0,
  },
  titleText: {
    fontSize: "25px",
  },
  content: {
    marginTop: -15,
    overflowY: "auto",
    marginTop: 0,
  },
  description: {
    marginTop: 15,
    marginBottom: 15,
    margin: 5,
  },
  loadingDialog: {
    textAlign: "center",
    margin: 50,
    overflow: "hidden",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    margin: "5px 15px 5px 15px",
  },
  loadingSave: {
    textAlign: "center",
    overflow: "hidden",
  },
}));

export const DashboardModal = ({
  show,
  newSat,
  initValues,
  handleClose,
  width,
  height,
}) => {
  const classes = useStyles();
  const history = useHistory();
  const { setOpenAlert, alert, setAlert, setOpenSnack, snack, setSnack } =
    useContext(HelpersContext);
      
  const [editing, setEditing] = useState(newSat || false);
  const [satSchema, setSatSchema] = useState(null);
  const location = useLocation();
  let path = location.pathname;
  path = path.substring(1);
    
  const [user, schemas, sats, isLoadingSch, isLoadingSat] = useTracker(() => {
    const subSch = Meteor.subscribe("schemas");
    const subSat = Meteor.subscribe("satellites");
    const schemas = SchemaCollection.find().fetch();
    var sats = []
    if(path){
      sats = SatelliteCollection.find(
        {
          noradID: path,
        },
        {}
        ).fetch();
      }else{
        sats = SatelliteCollection.find().fetch();
      }
    const user = Meteor.user();
    return [user, schemas, sats, !subSch.ready(), !subSat.ready()];
  });

  const isUniqueList = (path, field) => {
    let list = [];
    if (!path) {
      for (let sat in sats) {
        sats[sat][field] === initValues[field]
          ? null
          : list.push(sats[sat][field]);
      }
    } else if (initValues[path]) {
      for (let sat in sats) {
        let satEntries = sats[sat][path];
        for (let entry in satEntries) {
          satEntries[entry][field] ===
          (initValues[path].length > 0 ? initValues[path][entry][field] : false)
            ? null
            : list.push(satEntries[entry][field]);
        }
      }
    }
    return list;
  };

  useEffect(() => {
    setEditing(newSat || false); // ensures that Add Satellite always opens as a new instance in edit-mode
  }, [newSat, show]);

  useEffect(() => {
    setSatSchema(satelliteValidatorShaper(schemas, initValues, isUniqueList)); // generate new validation schema based on schema changes and the satellite being edited
  }, [initValues, show, isLoadingSch]);

  const handleSubmit = (values, { setSubmitting }) => {
    emptyDataRemover(values); // remove schemas that were added by the user but contain no entries

    if (newSat) {
      Meteor.call("addNewSatellite", values, initValues, (err, res) => {
        if (res || err) {
          console.log(res || err);
        } else {
          setOpenSnack(false);
          setSnack(
            <span>
              <strong>{values.names[0].name}</strong> saved!
            </span>
          );
          setOpenSnack(true);
        }
      });
    } else {
      Meteor.call("updateSatellite", values, initValues, (err, res) => {
        if (res || err) {
          console.log(res || err);
        } else {
          setOpenSnack(false);
          setSnack(
            <span>
              Changes on{" "}
              <strong>
                {values.names && values.names[0] ? values.names[0].name : "N/A"}
              </strong>{" "}
              saved!
            </span>
          );
          setOpenSnack(true);
        }
      });
    }
    setSubmitting(false);
    setEditing(false);
  };

  const handleDelete = () => {
    Meteor.call("deleteSatellite", initValues, user, (err, res) => {
      if (res || err) {
        console.log(res || err);
      } else {
        setOpenAlert(false);
        handleClose();
        setOpenSnack(false);
        setSnack(
          <span>
            Deleted{" "}
            <strong>
              {initValues.names ? initValues.names[0].name : "N/A"}
            </strong>
            !
          </span>
        );
        setOpenSnack(true);
      }
    });
  };

  const handleDeleteDialog = () => {
    setAlert({
      title: (
        <span>
          Delete{" "}
          <strong>{initValues.names ? initValues.names[0].name : "N/A"}</strong>
          ?
        </span>
      ),
      text: (
        <span>
          Are you sure you want to delete{" "}
          <strong>{initValues.names ? initValues.names[0].name : "N/A"}</strong>{" "}
          and all of its data?
        </span>
      ),
      actions: (
        <Button
          size={width && width < 500 ? "small" : "medium"}
          variant="contained"
          color="secondary"
          disableElevation
          onClick={handleDelete}
        >
          Confirm
        </Button>
      ),
      closeAction: "Cancel",
    });
    setOpenAlert(true);
  };

  const handleToggleEdit = (setValues, values) => {
    emptyDataRemover(values);
    if (editing) setValues(initValues);
    if (newSat && editing) handleClose();
    setEditing(!editing);
  };

  const handleEdit = (setValues, dirty, touched, values) => {
    if (editing && dirty && Object.keys(touched).length) {
      setAlert({
        title: initValues.names ? (
          <span>
            Delete changes on{" "}
            <strong>
              {initValues.names ? initValues.names[0].name : "N/A"}
            </strong>
            ?
          </span>
        ) : (
          <span>Delete changes on new satellite?</span>
        ),
        text: initValues.names ? (
          <span>
            Are you sure you want to cancel all changes made to{" "}
            <strong>
              {initValues.names ? initValues.names[0].name : "N/A"}
            </strong>{" "}
            and its data?
          </span>
        ) : (
          <span>
            Are you sure you want to delete all the changes made to this new
            satellite?
          </span>
        ),
        actions: (
          <Button
            size={width && width < 500 ? "small" : "medium"}
            variant="contained"
            color="secondary"
            disableElevation
            onClick={() => {
              setOpenAlert(false);
              handleToggleEdit(setValues, values);
            }}
          >
            Confirm
          </Button>
        ),
        closeAction: "Cancel",
      });
      setOpenAlert(true);
    } else {
      handleToggleEdit(setValues, values);
    }
  };

  const decideHeight = () => {
    let decidedHeight = `${0.043 * height + 36}vh`;
    if (height > 1000) decidedHeight = "80vh";
    return { height: decidedHeight };
  };

  return (
    <>
      <AlertDialog bodyAlert={alert} />
      <SnackBar bodySnackBar={snack} />
      <Dialog open={show} scroll="paper" maxWidth="md">
        <div className={classes.modal}>
          <DialogTitle className={classes.title}>
            <Typography className={classes.titleText}>
              {newSat ? (
                <>
                  Creating <strong>New Satellite</strong>
                </>
              ) : (
                <>
                  Editing{" "}
                  <strong>
                    {initValues.names && initValues.names[0]
                      ? initValues.names[0].name
                      : "N/A"}
                  </strong>
                </>
              )}
            </Typography>
          </DialogTitle>
          <Formik
            initialValues={initValues}
            onSubmit={handleSubmit}
            validationSchema={satSchema}
          >
            {({
              errors,
              isSubmitting,
              values,
              setValues,
              setFieldValue,
              dirty,
              touched,
              setTouched,
            }) => (
              <Form>
                {isLoadingSch || isLoadingSat ? (
                  <DialogContent className={classes.loadingDialog}>
                    <CircularProgress size={75} />
                  </DialogContent>
                ) : (
                  <DialogContent
                    className={classes.content}
                    style={decideHeight()}
                  >
                    <div style={{display: 'flex', justifyContent: "center"}}>
                      <Gallery initValues={initValues}/>
                    </div>
                    <Typography className={classes.description}></Typography>
                    <SatelliteForm
                      errors={errors}
                      values={values}
                      schemas={schemas}
                      setValues={setValues}
                      setFieldValue={setFieldValue}
                      editing={editing}
                      initValues={initValues}
                      newSat={newSat}
                      setSatSchema={setSatSchema}
                      isUniqueList={isUniqueList}
                      satelliteValidatorShaper={satelliteValidatorShaper}
                      setTouched={setTouched}
                    />
                  </DialogContent>
                )}
                <DialogActions className={classes.actions}>
                  {editing ? null : (
                    <ProtectedFunctionality
                      component={() => {
                        return (
                          <Button
                            size={width && width < 500 ? "small" : "medium"}
                            variant="contained"
                            color="secondary"
                            onClick={handleDeleteDialog}
                            startIcon={width && width < 500 ? null : <Delete />}
                          >
                            Delete
                          </Button>
                        );
                      }}
                      loginRequired={true}
                    />
                  )}
                  <ProtectedFunctionality
                    component={() => {
                      return (
                        <Button
                          size={width && width < 500 ? "small" : "medium"}
                          variant="contained"
                          color={
                            editing && dirty && Object.keys(touched).length
                              ? "secondary"
                              : "default"
                          }
                          onClick={() =>
                            handleEdit(setValues, dirty, touched, values)
                          }
                          startIcon={
                            width && width < 500 ? null : editing ? (
                              dirty && Object.keys(touched).length ? (
                                <Delete />
                              ) : null
                            ) : (
                              <Edit />
                            )
                          }
                        >
                          {editing ? "Cancel" : "Edit"}
                        </Button>
                      );
                    }}
                    loginRequired={true}
                  />
                  {editing ? null : (
                    <Button
                      size={width && width < 500 ? "small" : "medium"}
                      variant="contained"
                      onClick={() =>{
                        path ? history.push(`/`) 
                        : handleClose()
                      }}
                      startIcon={width && width < 500 ? null : <Close />}
                    >
                      Close
                    </Button>
                  )}
                  {editing && (
                    <Button
                      size={width && width < 500 ? "small" : "medium"}
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={width && width < 500 ? null : <Save />}
                      disabled={
                        Object.entries(errors).length > 0 ||
                        !dirty ||
                        Object.entries(touched).length === 0
                          ? true
                          : false
                      }
                    >
                      {isSubmitting ? (
                        <CircularProgress
                          size={25}
                          className={classes.loadingSave}
                        />
                      ) : newSat ? (
                        "Save"
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  )}
                </DialogActions>
              </Form>
            )}
          </Formik>
        </div>
      </Dialog>
    </>
  );
};