'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Block } from '@/types/blockchain';
import { ChevronRight, Hash, Clock, Database } from 'lucide-react';

interface BlockchainVisualizationProps {
  blocks: Block[];
}

export default function BlockchainVisualization({ blocks }: BlockchainVisualizationProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const blockVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Blockchain Visualization
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Visual representation of the transaction blockchain
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <motion.div
            className="flex space-x-4 p-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {blocks.map((block, index) => (
              <React.Fragment key={block.id}>
                <motion.div
                  variants={blockVariants}
                  className="flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="w-64 h-48 border-2 border-blue-200 bg-blue-50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">Block #{index + 1}</Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {block.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs">
                          <Hash className="h-3 w-3" />
                          <span className="font-mono text-xs truncate">
                            {block.hash.substring(0, 16)}...
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Prev: {block.previousHash.substring(0, 8)}...
                        </div>
                      </div>
                      
                      <div className="border-t pt-2">
                        <div className="text-xs font-medium mb-1">
                          Transactions: {block.transactions.length}
                        </div>
                        <div className="space-y-1 max-h-16 overflow-y-auto">
                          {block.transactions.slice(0, 3).map((tx, txIndex) => (
                            <div key={txIndex} className="text-xs bg-white p-1 rounded">
                              <span className="font-medium">{tx.action}</span>
                              <span className="text-muted-foreground ml-1">
                                - {tx.farmerName}
                              </span>
                            </div>
                          ))}
                          {block.transactions.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{block.transactions.length - 3} more...
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                
                {index < blocks.length - 1 && (
                  <motion.div
                    className="flex items-center justify-center h-48"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 * (index + 1) }}
                  >
                    <ChevronRight className="h-6 w-6 text-blue-400" />
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </motion.div>
        </ScrollArea>
        
        {blocks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>No blocks in the chain yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
