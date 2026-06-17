import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Sheet } from './Sheet';
import { Button } from './Button';
import { robot } from '@/services/robot';
import type { ConnectionState } from '@/types/robot';
import { useTheme } from '@/hooks/useTheme';
import { COLORS, SPACING } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ConnectionSheet({ visible, onClose }: Props) {
  const { c } = useTheme();
  const [state, setState] = useState<ConnectionState>(robot.getConnectionState());
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    return robot.onConnectionStateChange(setState);
  }, []);

  const isConnected = state === 'connected';
  const isConnectingFromState = state === 'connecting';

  return (
    <Sheet visible={visible} onClose={onClose} title="Robot connection">
      <View style={{ gap: SPACING.md }}>
        <View style={[styles.statusRow, { backgroundColor: c.surface2 }]}>
          <View style={[styles.dot, { backgroundColor: dotColor(state) }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusLabel, { color: c.textPrimary }]}>
              {labelFor(state)}
            </Text>
            <Text style={[styles.sub, { color: c.textSecondary }]}>
              {isConnected ? 'Robot-A1B2 · BLE (mock)' : 'No robot connected (mock service)'}
            </Text>
          </View>
        </View>
         {isConnected ? (
           <Button
             label="Disconnect"
             variant="destructive"
             loading={isDisconnecting}
             fullWidth
             onPress={async () => {
               setIsDisconnecting(true);
               try {
                 await robot.disconnect();
               } finally {
                 setIsDisconnecting(false);
               }
             }}
           />
         ) : (
           <Button
             label={isConnectingFromState || isConnecting ? 'Connecting…' : 'Connect'}
             loading={isConnecting}
             fullWidth
             onPress={async () => {
               setIsConnecting(true);
               try {
                 await robot.connect();
               } finally {
                 setIsConnecting(false);
               }
             }}
           />
         )}
        <Text style={[styles.foot, { color: c.textMuted }]}>
          Mock service. Real BLE arrives in Phase 2.
        </Text>
      </View>
    </Sheet>
  );
}

function labelFor(s: ConnectionState): string {
  switch (s) {
    case 'connected': return 'Connected';
    case 'connecting': return 'Connecting…';
    case 'error': return 'Error';
    default: return 'Disconnected';
  }
}

function dotColor(s: ConnectionState): string {
  switch (s) {
    case 'connected': return COLORS.status.ok;
    case 'connecting': return COLORS.status.warn;
    case 'error': return COLORS.status.err;
    default: return '#9AA0AE';
  }
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 12,
    gap: SPACING.sm,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  statusLabel: { fontSize: 16, fontWeight: '700' },
  sub: { fontSize: 13, marginTop: 2 },
  foot: { fontSize: 12, textAlign: 'center' },
});
