import React from 'react';
import { MultiSelectTextInput } from './MultiSelectTextInput';
import { FormControl, Grid, InputLabel, makeStyles, MenuItem, Select, TextField } from '@material-ui/core';
import { Field } from 'formik';

export const SchemaFormField = ( {index, field, setFieldValue, editing} ) => {

  const onNameChange = (event) => {
    setFieldValue(event.target.name, event.target.value);
  }

  const onTypeChange = (event) => {
    setFieldValue(event.target.name, event.target.value);
  }
  
  return (
      <Grid container item>
        <Grid container item spacing={2}>
          <Grid item xs>
            <Field
              inputProps={{
                name: `fields.${index}.name`
              }}
              value={field.name}
              onChange={onNameChange}
              label="Field name"
              margin="dense"
              required
              fullWidth
              variant="outlined"
              disabled={!editing}
              component={TextField}
            />
          </Grid>
          <Grid item xs>
            <FormControl 
              variant="outlined"
              margin="dense"
              fullWidth
            >
              <InputLabel htmlFor={`schema-field-${index}-data-type-label`}>
                Data type
              </InputLabel>
              <Field 
                label="Data type"
                inputProps={{
                  id: `schema-field-${index}-data-type-label`,
                  name: `fields.${index}.type`
                }}
                value={field.type}
                onChange={onTypeChange}
                disabled={!editing}
                component={Select}
              >
                <MenuItem value="string">String</MenuItem>
                <MenuItem value="number">Number</MenuItem>
              </Field>
            </FormControl>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <MultiSelectTextInput
            index={index}
            allowedValues={field.allowed} 
            disabled={!editing}
            setFieldValue={setFieldValue}
          />
        </Grid>
      </Grid>
  )
};
