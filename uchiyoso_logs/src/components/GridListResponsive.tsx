import React from "react";
import {GridList, GridListProps, isWidthDown} from "@material-ui/core";
import withWidth from "@material-ui/core/withWidth";
import {Breakpoint} from "@material-ui/core/styles/createBreakpoints";

type Cols = {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
};

const f = (cols: Partial<Cols>): Cols => {
    const xs = cols.xs ?? 1;
    const sm = cols.sm ?? xs;
    const md = cols.sm ?? sm;
    const lg = cols.sm ?? md;
    const xl = cols.sm ?? lg;
    return { xs, sm, md, lg, xl };
};

const getGridListCols = (width: Breakpoint, cols: Partial<Cols>) => {
    const filledCols = f(cols);
    if (isWidthDown('xs', width)) {
        return filledCols.xs;
    }
    if (isWidthDown('sm', width)) {
        return filledCols.sm;
    }
    if (isWidthDown('md', width)) {
        return filledCols.md;
    }
    if (isWidthDown('lg', width)) {
        return filledCols.lg;
    }
    if (isWidthDown('xl', width)) {
        return filledCols.xl;
    }
    return filledCols.xl;   // should throw?
};

type GridListResponsiveProps = {
    width: Breakpoint
    rCols?: Partial<Cols>
} & GridListProps;

function GridListResponsive(props: GridListResponsiveProps) {
    const {width, rCols, ...others} = props;
    const cols = rCols ?? {};
    return <GridList cols={getGridListCols(width, cols)} {...others} />;
}

export default withWidth()(GridListResponsive);
