import React from 'react';
import {AppBar, AppBarProps, createStyles, makeStyles, Theme} from "@material-ui/core";
import Box from "@material-ui/core/Box";


const useStyles = makeStyles((theme: Theme) => createStyles({
    offset: theme.mixins.toolbar,
}));

export default function StickyAppBar<T extends AppBarProps>(props: T) {
    const classes = useStyles();
    return (
        <>
            <AppBar {...props} position="fixed" />
            <Box className={classes.offset} />
        </>
    );
}
