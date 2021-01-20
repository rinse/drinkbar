import React from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import {createStyles} from '@material-ui/core'

type ImageProps = React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>

const useStyles = makeStyles((theme) => createStyles({
    root: {
        maxWidth: "100%",
        height: "auto",
    },
}))

export default function Image(props: ImageProps) {
    const classes = useStyles()
    const {alt, ...others} = props
    return <img alt={alt} className={classes.root} {...others} />
}
