import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export const Hero = () => {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="relative p-6"
    >
      <div className="relative">
        <h1 className="text-4xl font-bold text-foreground">
          Welcome back, {user?.name?.split(' ')[0] || 'Athish'}
        </h1>
      </div>
    </motion.div>
  );
};
