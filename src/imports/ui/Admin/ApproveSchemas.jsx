import React, { useState } from "react";
// Imports
import { useTracker } from "meteor/react-meteor-data";
import { SchemaCollection } from "../../api/schemas";

// Components
import { SchemaModal } from "../SchemaModal/SchemaModal.jsx";

// @material-ui
import {
  makeStyles,
  Typography,
  Table,
  TableContainer,
  Paper,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    paddingTop: 5,
    paddingBottom: 5
  },
  table: {
    margin: "10px 10px 10px 10px",
    width: "auto",
    overflow: "auto",
    height: "100%",
    backgroundColor: theme.palette.grid.background,
  },
  header: {
    paddingTop: 12.5,
    paddingBottom: 12.5,
    width: "25%",
  },
  tableRow: {
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      cursor: "pointer",
    },
  },
  spinner: {
    color: theme.palette.text.primary,
  },
  link: {
    color: theme.palette.text.primary,
    "&:hover": {
      color: theme.palette.info.light,
    },
  },
}));

const newSchemaValues = {
  name: "",
  description: "",
  fields: [
    {
      name: "reference",
      description: "",
      type: "url",
      allowedValues: [],
      min: null,
      max: null,
      required: true,
    },
  ],
};

export const ApproveSchemas = () => {
  const classes = useStyles();

  const [showModal, setShowModal] = useState(false);
  const [initialSchemaValues, setInitialSchemaValues] =
    useState(newSchemaValues);

  const [schemas, isLoading] = useTracker(() => {
    const sub = Meteor.subscribe("schemas");
    const schemas = SchemaCollection.find().fetch();
    return [schemas, !sub.ready()];
  });

  const handleRowClick = (schemaObject) => {
    setShowModal(true);
    setInitialSchemaValues(schemaObject);
  };

  return (
    <div className={classes.root}>
      <TableContainer component={Paper} className={classes.table}>
        <Table size="small" aria-label="Schema table">
          <TableHead>
            <TableRow color="secondary">
              <TableCell className={classes.header}>
                <Typography variant="body2">SCHEMA NAME</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">APPROVAL</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">DELETION</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">MODIFIED ON</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">MODIFIED BY</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <CircularProgress className={classes.spinner} />
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              schemas.map((schema, i) => {
                return schema.isDeleted ||
                  (!schema.adminCheck && schema.adminCheck !== undefined) ? (
                  <TableRow
                    key={`schema-row-${i}`}
                    className={classes.tableRow}
                    onClick={() => handleRowClick(schema)}
                  >
                    <TableCell
                      key={`schema-name-${i}`}
                      className={classes.tableNameCol}
                    >
                      {schema.name}
                    </TableCell>
                    <TableCell key={`schema-approve-${i}`}>
                      {!schema.adminCheck ? "TRUE" : "FALSE"}
                    </TableCell>
                    <TableCell key={`schema-delete-${i}`}>
                      {schema.isDeleted ? "TRUE" : "FALSE"}
                    </TableCell>
                    <TableCell key={`schema-modOn-${i}`}>
                      {`${schema.modifiedOn || schema.createdOn}`}
                    </TableCell>
                    <TableCell key={`schema-modBy-${i}`}>
                      {`${schema.modifiedBy || schema.createdBy}`}
                    </TableCell>
                  </TableRow>
                ) : null;
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <SchemaModal
        show={showModal}
        initValues={initialSchemaValues}
        handleClose={() => setShowModal(false)}
        admin={true}
      />
    </div>
  );
};