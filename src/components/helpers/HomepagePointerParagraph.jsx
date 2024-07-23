import {motion} from "framer-motion";
import "../css/Homepage.css"

export const Point = (props) => {
    return (
        <motion.p 
        className="pointer"
        initial={{
            opacity:0
          }}
          whileInView={{
            opacity:1
          }}
          transition={{
            duration:"1.5"
          }}
        >
            {props.point}
        </motion.p>
    )
}

 