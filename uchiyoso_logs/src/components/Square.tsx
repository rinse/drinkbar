import React from "react";
import {Box, BoxProps, createStyles} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";

type SquareProps = BoxProps;

const useStyles = makeStyles((theme) => createStyles({
    root: {
        width: "100%",
        height: "0",
        paddingBottom: "100%",
    },
}));

export default function Square(props: SquareProps) {
    const classes = useStyles();
    const {children, ...others} = props;
    return (
        <Box className={classes.root} {...others}>{children}</Box>
    );
}
