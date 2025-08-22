import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

const AnimatedCard = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.02, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
  >
    <Card {...props}>{children}</Card>
  </motion.div>
);

export default AnimatedCard;
