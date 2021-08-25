import React, { useState, useContext } from "react";
import { SatelliteSchemaAccordion } from "./SatelliteSchemaAccordion";
import {
  Grid,
  Button,
  makeStyles,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  IconButton,
  Tooltip,
  Paper,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import { Field } from "formik";
import HelpersContext from "../helpers/HelpersContext.jsx";
import AlertDialog from "../helpers/AlertDialog.jsx";
import { TextField } from "formik-material-ui";

const useStyles = makeStyles((theme) => ({
  addSchemaContainer: {
    textAlign: "center",
    margin: 10,
  },
  addItem: {
    alignItems: "center",
  },
  noradID: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.action.hover,
  },
}));

export const SatelliteForm = ({
  errors,
  formValues,
  schemas,
  setValues,
  setFieldValue,
  editing,
  initValues,
  newSat,
}) => {
  const { setOpenAlert, alert, setAlert } = useContext(HelpersContext);
  const [schemaAddition, setSchemaAddition] = useState(false);
  const [addSchema, setAddSchema] = useState("");
  const [flag, setFlag] = useState(true);
  const classes = useStyles();

  const handleNewSchema = async () => {
    initValues[`${addSchema}`] = [];
    setAddSchema("");
    setFlag(!flag);
    toggleAddSchema();
  };

  const handleDelete = (name) => {
    setAlert({
      title: (
        <span>
          Delete <strong>{name}</strong> Schema?
        </span>
      ),
      text: (
        <span>
          Are you sure you want to delete <strong>{name}</strong> and all of its
          data?
        </span>
      ),
      actions: (
        <Button
          variant="contained"
          size="small"
          color="secondary"
          disableElevation
          onClick={() => {
            delete initValues[`${name}`];
            setFlag(!flag);
            setOpenAlert(false);
          }}
        >
          Confirm
        </Button>
      ),
      closeAction: "Cancel",
    });
    setOpenAlert(true);
  };

  const onSchemaChange = (e) => {
    setAddSchema(e.target.value);
  };

  const toggleAddSchema = () => {
    setSchemaAddition(!schemaAddition);
  };

  return (
    <Grid container spacing={1}>
      <Grid container item>
        <Grid item xs={12}>
          <Paper className={classes.noradID}>
            <Field
              name="noradID"
              label="NORAD ID"
              margin="dense"
              required
              fullWidth
              variant="outlined"
              disabled={!editing}
              component={TextField}
            />
          </Paper>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        {schemas.map((schema, index) => {
          return schema.name === "names" ? (
            <span key={index} style={{ display: "flex" }}>
              <SatelliteSchemaAccordion
                errors={errors}
                key={index}
                schema={schema}
                entries={formValues[`${schema.name}`]}
                setFieldValue={setFieldValue}
                editing={editing}
                setValues={setValues}
                newSat={newSat}
              />
              {editing && (
                <Tooltip title={`Delete ${schema.name}`}>
                  <IconButton
                    style={{ alignSelf: "flex-start" }}
                    onClick={() => handleDelete(schema.name)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </span>
          ) : (
            []
          );
        })}
        {schemas.map((schema, index) => {
          return initValues[schema.name] && schema.name !== "names" ? (
            <span key={index} style={{ display: "flex" }}>
              <SatelliteSchemaAccordion
                key={index}
                schema={schema}
                entries={formValues[`${schema.name}`]}
                setFieldValue={setFieldValue}
                editing={editing}
                setValues={setValues}
              />
              {editing && (
                <Tooltip title={`Delete ${schema.name}`}>
                  <IconButton
                    style={{ alignSelf: "flex-start" }}
                    onClick={() => handleDelete(schema.name)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </span>
          ) : (
            []
          );
        })}
      </Grid>

      {editing && schemaAddition && (
        <Grid item container xs={12} className={classes.addItem}>
          <Grid item xs={10}>
            <FormControl variant="outlined" margin="dense" fullWidth>
              <InputLabel htmlFor={`satellite-field`}>Data type</InputLabel>
              <Field
                label="Data Type"
                inputProps={{
                  id: `satellite-field`,
                  name: `satellite-field`,
                }}
                component={Select}
                value={addSchema}
                onChange={onSchemaChange}
              >
                <MenuItem disabled value={""}>
                  <em>Available Schemas</em>
                </MenuItem>
                {schemas.map((schema, index) => {
                  if (
                    schema.name !== "name" &&
                    (initValues[`${schema.name}`] ? false : true)
                  ) {
                    return (
                      <MenuItem key={index} dense value={`${schema.name}`}>
                        {schema.name}
                      </MenuItem>
                    );
                  }
                })}
              </Field>
            </FormControl>
          </Grid>
          <Grid item xs style={{ marginLeft: 10, marginTop: 5 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNewSchema}
              className={classes.addField}
              fullWidth
              disabled={!addSchema}
            >
              + Add
            </Button>
          </Grid>
        </Grid>
      )}
      <Grid item xs={12} className={classes.addSchemaContainer}>
        {editing && !schemaAddition && (
          <Button
            variant="contained"
            color="default"
            onClick={toggleAddSchema}
            className={classes.addField}
          >
            + Add Schema
          </Button>
        )}
        {editing && schemaAddition && (
          <Button
            variant="contained"
            color="default"
            onClick={toggleAddSchema}
            className={classes.addField}
          >
            Close Add Schema
          </Button>
        )}
      </Grid>
    </Grid>
  );
};
