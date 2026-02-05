import { motion } from "framer-motion";

const BlurInText = ({ text, className = "", delay = 0 }) => {
    return (
        <motion.h1
            initial={{ filter: "blur(20px)", opacity: 0, y: 10 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
            className={className}
        >
            {text}
        </motion.h1>
    );
};

export default BlurInText;
