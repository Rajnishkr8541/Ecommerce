import {motion} from "framer-motion";

const AuthLayout = ({children}: {children: React.ReactNode}) => {
    return(
        <div className="min-h-screen flex item-center">
            <motion.div 
            initial={{opacity:0, scale:0.9}}
            animate={{opacity:1, scale:1}}
            transition={{duration:0.6, ease:"easeOut"}}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default AuthLayout