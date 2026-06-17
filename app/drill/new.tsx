import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, GripVertical, Plus, Trash2, X } from 'lucide-react-native';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { GlassBar } from '@/components/common/GlassBar';
import { Pill } from '@/components/common/Pill';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { ControlSurface } from '@/components/control/ControlSurface';
import { Sheet } from '@/components/common/Sheet';

import { useDrillStore } from '@/stores/drillStore';
import {
  DRILL_CATEGORIES,
  DRILL_COLORS,
  type DrillCategory,
  type Shot,
} from '@/types/drill';
import type { BallParameters } from '@/types/robot';
import { DEFAULT_PARAMS } from '@/constants/drills';
import { uid } from '@/utils/id';

import { useTheme } from '@/hooks/useTheme';
import { RADIUS, SPACING } from '@/constants/theme';
import { paramSummary } from '@/utils/format';

export default function DrillBuilder() {
  const { c } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ editId?: string }>();
  const existing = useDrillStore((s) =>
    params.editId ? s.drills.find((d) => d.id === params.editId) : undefined,
  );
  const createDrill = useDrillStore((s) => s.createDrill);
  const updateDrill = useDrillStore((s) => s.updateDrill);

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [category, setCategory] = useState<DrillCategory>(existing?.category ?? 'custom');
  const [color, setColor] = useState<string>(existing?.color ?? DRILL_COLORS[0]!);
  const [type, setType] = useState<'static' | 'sequence'>(existing?.type ?? 'static');
  const [staticParams, setStaticParams] = useState<BallParameters>(
    existing?.params ?? DEFAULT_PARAMS,
  );
  const [shots, setShots] = useState<Shot[]>(
    existing?.shots ?? [{ id: uid(), params: DEFAULT_PARAMS, ballCount: 1 }],
  );
  const [editingShot, setEditingShot] = useState<Shot | null>(null);

  const isEditing = !!existing;

  const originalName = existing?.name ?? '';
  const originalDescription = existing?.description ?? '';

  const canSave = name.trim().length > 0 && (type === 'static' || shots.length > 0);

  const onSave = () => {
    if (!canSave) {
      Alert.alert('Name is required');
      return;
    }
    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      color,
      type,
      ...(type === 'static' ? { params: staticParams, shots: undefined } : { shots, params: undefined }),
    };
    if (isEditing && existing) {
      updateDrill(existing.id, payload);
    } else {
      createDrill(payload);
    }
    router.back();
  };

  const onCancel = () => {
    const changed =
      name !== originalName ||
      description !== originalDescription;
    if (changed) {
      Alert.alert('Discard changes?', '', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  const moveShot = (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= shots.length) return;
    const arr = [...shots];
    [arr[idx], arr[next]] = [arr[next]!, arr[idx]!];
    setShots(arr);
  };

  const removeShot = (id: string) => {
    setShots(shots.filter((s) => s.id !== id));
  };

  const addShot = () => {
    setShots([...shots, { id: uid(), params: DEFAULT_PARAMS, ballCount: 1 }]);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={onCancel} style={styles.iconBtn}>
          <X size={22} color={c.textPrimary} />
        </Pressable>
        <Text style={[styles.topTitle, { color: c.textPrimary }]}>
          {isEditing ? 'Edit drill' : 'New drill'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.md, gap: SPACING.md, paddingBottom: 160 }}>
        <Card>
          <Text style={[styles.label, { color: c.textSecondary }]}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Drill name"
            placeholderTextColor={c.textMuted}
            style={[styles.input, { color: c.textPrimary, borderColor: c.border }]}
          />
          <Text style={[styles.label, { color: c.textSecondary, marginTop: SPACING.sm }]}>
            Description (optional)
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What is this drill for?"
            placeholderTextColor={c.textMuted}
            multiline
            style={[
              styles.input,
              { color: c.textPrimary, borderColor: c.border, minHeight: 64, textAlignVertical: 'top' },
            ]}
          />
        </Card>

        <Card>
          <Text style={[styles.label, { color: c.textSecondary }]}>Category</Text>
          <View style={styles.row}>
            {DRILL_CATEGORIES.map((cat) => (
              <Pill
                key={cat}
                label={cat[0]!.toUpperCase() + cat.slice(1)}
                active={category === cat}
                onPress={() => setCategory(cat)}
              />
            ))}
          </View>
          <Text style={[styles.label, { color: c.textSecondary, marginTop: SPACING.md }]}>
            Color
          </Text>
          <View style={styles.colorRow}>
            {DRILL_COLORS.map((col) => (
              <Pressable
                key={col}
                onPress={() => setColor(col)}
                style={[
                  styles.colorDot,
                  {
                    backgroundColor: col,
                    borderColor: color === col ? c.textPrimary : 'transparent',
                  },
                ]}
              />
            ))}
          </View>
        </Card>

        <Card>
          <Text style={[styles.label, { color: c.textSecondary }]}>Type</Text>
          <SegmentedControl<'static' | 'sequence'>
            segments={[
              { value: 'static', label: 'Static' },
              { value: 'sequence', label: 'Sequence' },
            ]}
            value={type}
            onChange={setType}
          />
        </Card>

        {type === 'static' ? (
          <ControlSurface
            value={staticParams}
            onChange={(p) => setStaticParams({ ...staticParams, ...p })}
            showBallCountTarget={false}
          />
        ) : (
          <View style={{ gap: SPACING.sm }}>
            <Text style={[styles.section, { color: c.textPrimary }]}>Shots</Text>
            {shots.map((shot, i) => (
              <Card key={shot.id} variant="flat">
                <View style={styles.shotRow}>
                  <GripVertical size={18} color={c.textMuted} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.shotTitle, { color: c.textPrimary }]}>
                      Shot {i + 1}
                    </Text>
                    <Text style={[styles.shotSub, { color: c.textSecondary }]}>
                      {paramSummary(shot.params)}
                    </Text>
                    <Text style={[styles.shotSub, { color: c.textMuted }]}>
                      {shot.ballCount ? `${shot.ballCount} balls` : shot.duration ? `${shot.duration}s` : '1 ball'}
                    </Text>
                  </View>
                  <View style={{ gap: 4 }}>
                    <Pressable onPress={() => moveShot(i, -1)} style={styles.smallBtn}>
                      <Text style={{ color: c.textSecondary }}>↑</Text>
                    </Pressable>
                    <Pressable onPress={() => moveShot(i, 1)} style={styles.smallBtn}>
                      <Text style={{ color: c.textSecondary }}>↓</Text>
                    </Pressable>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.sm }}>
                  <Button
                    label="Edit"
                    variant="secondary"
                    size="sm"
                    onPress={() => setEditingShot(shot)}
                  />
                  <Button
                    label="Remove"
                    variant="ghost"
                    size="sm"
                    leftIcon={<Trash2 size={14} color={c.textSecondary} />}
                    onPress={() => removeShot(shot.id)}
                  />
                </View>
              </Card>
            ))}
            <Button
              label="Add shot"
              variant="secondary"
              leftIcon={<Plus size={16} color={c.textPrimary} />}
              onPress={addShot}
            />
          </View>
        )}
      </ScrollView>

      <GlassBar>
        <View style={styles.actionBar}>
          <Button label="Cancel" variant="ghost" onPress={onCancel} />
          <Button
            label={isEditing ? 'Save changes' : 'Create drill'}
            disabled={!canSave}
            onPress={onSave}
            style={{ flex: 1 }}
          />
        </View>
      </GlassBar>

      <ShotEditor
        shot={editingShot}
        onClose={() => setEditingShot(null)}
        onSave={(updated) => {
          setShots(shots.map((s) => (s.id === updated.id ? updated : s)));
          setEditingShot(null);
        }}
      />
    </SafeAreaView>
  );
}

function ShotEditor({
  shot,
  onClose,
  onSave,
}: {
  shot: Shot | null;
  onClose: () => void;
  onSave: (s: Shot) => void;
}) {
  const { c } = useTheme();
  const [params, setParams] = useState<BallParameters>(shot?.params ?? DEFAULT_PARAMS);
  const [ballCount, setBallCount] = useState<string>(
    shot?.ballCount?.toString() ?? '1',
  );

  React.useEffect(() => {
    if (shot) {
      setParams(shot.params);
      setBallCount(shot.ballCount?.toString() ?? '1');
    }
  }, [shot]);

  if (!shot) return null;

  return (
    <Sheet visible={!!shot} onClose={onClose} title="Edit shot">
      <ScrollView style={{ maxHeight: 520 }}>
        <ControlSurface
          value={params}
          onChange={(p) => setParams({ ...params, ...p })}
          showBallCountTarget={false}
        />
        <View style={{ marginTop: SPACING.md }}>
          <Text style={{ color: c.textSecondary, fontSize: 13, marginBottom: SPACING.xs }}>
            Balls before next shot
          </Text>
          <TextInput
            value={ballCount}
            onChangeText={(t) => setBallCount(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            style={{
              borderWidth: 1,
              borderColor: c.border,
              padding: SPACING.sm,
              borderRadius: RADIUS.md,
              color: c.textPrimary,
              fontSize: 16,
            }}
          />
        </View>
      </ScrollView>
      <View style={{ marginTop: SPACING.md }}>
        <Button
          label="Save shot"
          fullWidth
          onPress={() =>
            onSave({
              ...shot,
              params,
              ballCount: Math.max(1, parseInt(ballCount, 10) || 1),
            })
          }
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
  },
  iconBtn: { padding: SPACING.xs },
  topTitle: { fontSize: 17, fontWeight: '700' },
  label: { fontSize: 13, marginBottom: SPACING.xs },
  input: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    fontSize: 15,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 3 },
  section: { fontSize: 18, fontWeight: '700', marginTop: SPACING.xs },
  shotRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  shotTitle: { fontSize: 15, fontWeight: '700' },
  shotSub: { fontSize: 12, marginTop: 2 },
  smallBtn: {
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBar: {
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
});
