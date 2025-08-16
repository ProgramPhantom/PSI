import React, { useEffect, useRef, useState } from 'react';
import { Card, Text, Button, Icon, Intent, Colors } from '@blueprintjs/core';

interface ConsoleEntry {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: Date;
  data?: any[];
}

interface ConsoleProps {
  isOpen: boolean;
}

const Console: React.FC<ConsoleProps> = ({ isOpen }) => {
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [entries]);

  useEffect(() => {
    if (!isOpen || isCapturing) return;

    setIsCapturing(true);

    // Store original console methods
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    // Override console methods
    console.log = (...args) => {
      addEntry('log', args);
      originalLog.apply(console, args);
    };

    console.warn = (...args) => {
      addEntry('warn', args);
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      addEntry('error', args);
      originalError.apply(console, args);
    };

    console.info = (...args) => {
      addEntry('info', args);
      originalInfo.apply(console, args);
    };

    // Cleanup function
    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.info = originalInfo;
      setIsCapturing(false);
    };
  }, [isOpen, isCapturing]);

  const addEntry = (type: ConsoleEntry['type'], args: any[]) => {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    
    const newEntry: ConsoleEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date(),
      data: args.length > 1 ? args : undefined
    };

    setEntries(prev => [...prev, newEntry]);
  };

  const clearConsole = () => {
    setEntries([]);
  };

  const getEntryIcon = (type: ConsoleEntry['type']) => {
    switch (type) {
      case 'log': return 'info-sign';
      case 'warn': return 'warning-sign';
      case 'error': return 'error';
      case 'info': return 'info-sign';
      default: return 'info-sign';
    }
  };

  const getEntryIntent = (type: ConsoleEntry['type']): Intent => {
    switch (type) {
      case 'log': return Intent.NONE;
      case 'warn': return Intent.WARNING;
      case 'error': return Intent.DANGER;
      case 'info': return Intent.PRIMARY;
      default: return Intent.NONE;
    }
  };

  const getEntryColor = (type: ConsoleEntry['type']) => {
    switch (type) {
      case 'log': return Colors.GRAY1;
      case 'warn': return Colors.ORANGE3;
      case 'error': return Colors.RED3;
      case 'info': return Colors.BLUE3;
      default: return Colors.GRAY1;
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString();
  };

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: Colors.DARK_GRAY5,
      color: Colors.LIGHT_GRAY5
    }}>
              {/* Console Header */}
        <div style={{ position: "relative", top: "0px", right: "0px", background: Colors.DARK_GRAY4,
                      padding: "4px", gap: "4px", display: "flex", flexDirection: "row", alignItems: "center"
         }}>
            <Button
              icon="play"
              size="small"
              text="Test"
              onClick={() => {
                console.log('This is a test log message');
                console.warn('This is a test warning message');
                console.error('This is a test error message');
                console.info('This is a test info message');
                console.log('Object test:', { name: 'Test Object', value: 42 });
              }}
              intent={Intent.SUCCESS}
            />
            <Button
              icon="trash"
              size="small"
              text="Clear"
              onClick={clearConsole}
              intent={Intent.DANGER}
            />
        </div>

      {/* Console Entries */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '8px',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        {entries.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            color: Colors.GRAY3
          }}>
            <Text>No console output yet. Start interacting with the application to see logs.</Text>
          </div>
        ) : (
          entries.map((entry) => (
            <Card
              key={entry.id}
              style={{
                margin: '4px 0',
                padding: '8px',
                backgroundColor: Colors.DARK_GRAY4,
                border: `1px solid ${Colors.DARK_GRAY3}`,
                borderRadius: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <Icon
                  icon={getEntryIcon(entry.type)}
                  intent={getEntryIntent(entry.type)}
                  style={{ marginRight: '8px', marginTop: '2px', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}>
                    <Text style={{ 
                      color: getEntryColor(entry.type),
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      fontSize: '10px'
                    }}>
                      {entry.type}
                    </Text>
                    <Text style={{ 
                      color: Colors.GRAY3,
                      fontSize: '10px'
                    }}>
                      {formatTimestamp(entry.timestamp)}
                    </Text>
                  </div>
                  <Text style={{ 
                    color: Colors.LIGHT_GRAY5,
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {entry.message}
                  </Text>
                  {entry.data && entry.data.length > 1 && (
                    <div style={{ 
                      marginTop: '8px',
                      padding: '8px',
                      backgroundColor: Colors.DARK_GRAY5,
                      borderRadius: '4px',
                      border: `1px solid ${Colors.DARK_GRAY3}`
                    }}>
                      <Text style={{ 
                        color: Colors.GRAY3,
                        fontSize: '10px',
                        marginBottom: '4px'
                      }}>
                        Additional data:
                      </Text>
                      {entry.data.slice(1).map((item, index) => (
                        <div key={index} style={{ marginTop: '4px' }}>
                          <Text style={{ color: Colors.LIGHT_GRAY5 }}>
                            {typeof item === 'object' 
                              ? JSON.stringify(item, null, 2)
                              : String(item)
                            }
                          </Text>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
};

export default Console;
