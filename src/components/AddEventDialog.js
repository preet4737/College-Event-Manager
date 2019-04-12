import React, { useEffect, useState, useCallback } from "react";

import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Dialog,
    Slide,
    TextField,
    Button,
    FormGroup,
    FormLabel,
    FormControl,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Close as CloseIcon } from "@material-ui/icons";

import client from "../util/client";
import { POS, PSOS } from "../util/constants";
import { act, useDispatch, useMappedState } from "../store";
import { useFormState } from "react-use-form-state";
import _ from "lodash";

import DatesDialog from './DatesDialog';
import DepartmentDialog from './DepartmentDialog';

// -----

const useStyles = makeStyles((theme) => ({
    eventForm: {
        padding: "1rem",
        paddingTop: "0.5rem",
    },

    submitContainer: {
        padding: "16px",
        display: "flex",
        justifyContent: "flex-end",
    },

    submitButton: {
        position: "absolute",
        right: "1rem",
        bottom: "0",
    },
}));

const Transition = (props) => <Slide direction='up' {...props} />;

// -----

function AddEventDialog() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const slotEvent = useMappedState(
        useCallback((state) => state.slotEvent, [])
    );
    const getInitialPos = useCallback(() => {
        const x = {};
        _.range(13).forEach(e => {
            x[`PO${e}`] = 0;
            if (e < 5)
                x[`PSO${e}`] = 0;
        });
        return x;
    }, []);

    const [formState, { text, number }] = useFormState({ ...getInitialPos() });

    const [event, setNewEvent] = useState(null);

    // -----

    useEffect(() => {
        document.addEventListener("keydown", escListener, false);
        return () => document.addEventListener("keydown", escListener, false);
    });

    // -----

    const closeDialog = useCallback((event) =>
        dispatch(act.CLOSE_ADD_EVENT_DIALOG(event))
    , []);
    
    const escListener = useCallback((event) => {
        if (event.keyCode === 27) closeDialog();
    }, []);

    const nextStep = useCallback(() => 
        dispatch(act.INCREMENT_EVENT_ADD_STEP())
    , []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = formState.values;

        client.events
            .post(formData)
            .then(r => r.data)
            .then(setNewEvent)
            .then(nextStep)
            .catch(console.error);
    };

    // -----

    const POForm = () => (
        <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">PO Table</FormLabel>
            <FormGroup row>
                {
                    POS.map((e, i) => (
                        <TextField
                            {...number(`PO${i}`)}
                            label={e.label}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            helperText={e.description}
                            margin='normal'/>
                    ))
                }
            </FormGroup>
        </FormControl>
    );

    const PSOForm = () => (
        <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">PSO Table</FormLabel>
            <FormGroup row>
                {
                    PSOS.map((e, i) => (
                        <TextField
                            {...number(`PSO${i}`)}
                            label={e.label}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            helperText={e.description}
                            margin='normal'/>
                    ))
                }
            </FormGroup>
        </FormControl>
    );

    // -----

    return (
        <Dialog TransitionComponent={Transition} open={!!slotEvent}>
            <div>
                <AppBar color='secondary' position='sticky'>
                    <Toolbar variant='dense' disableGutters>
                        <IconButton onClick={closeDialog} color='inherit'>
                            <CloseIcon />
                        </IconButton>

                        <Typography variant='subtitle1' color='inherit'>
                            New Event
                        </Typography>
                    </Toolbar>
                </AppBar>

                <form autoComplete='off' className={classes.eventForm} onSubmit={handleSubmit}>
                    <TextField
                        {...text("name")}
                        label='Event Name'
                        InputLabelProps={{
                            shrink: true,
                        }}
                        fullWidth
                        margin='normal'
                    />
                    <TextField
                        {...text("venue")}
                        label='Venue'
                        InputLabelProps={{
                            shrink: true,
                        }}
                        fullWidth
                        margin='normal'
                    />
                    <TextField
                        {...text("description")}
                        label='Description'
                        InputLabelProps={{
                            shrink: true,
                        }}
                        rowsMax='4'
                        multiline
                        fullWidth
                        margin='normal'
                    />
                    <TextField
                        {...text("organizer")}
                        label='Organizer'
                        InputLabelProps={{
                            shrink: true,
                        }}
                        fullWidth
                        margin='normal'
                    />
                    <TextField
                        {...text("expert_name")}
                        label='Expert Name'
                        InputLabelProps={{
                            shrink: true,
                        }}
                        fullWidth
                        margin='normal'
                    />

                    <POForm />
                    <PSOForm />

                    <div className={classes.submitContainer}>
                        <Button
                            color='primary'
                            variant='contained'
                            type='submit'>
                            Submit
                        </Button>
                    </div>
                </form>
            </div>

            <DatesDialog event={event} />
            <DepartmentDialog event={event} />
        </Dialog>
    );
}

export default AddEventDialog;
