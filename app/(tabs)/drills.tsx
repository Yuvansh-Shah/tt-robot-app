import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search } from 'lucide-react-native';

import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Pill } from '@/components/common/Pill';
import { DrillCard } from '@/components/drills/DrillCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Sheet } from '@/components/common/Sheet';
import { Button } from '@/components/common/Button';

import { useDrillStore } from '@/stores/drillStore';
import type { Drill, DrillCategory } from '@/types/drill';
import { DRILL_CATEGORIES } from '@/types/drill';

import { useTheme } from '@/hooks/useTheme';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';

type Filter = 'all' | DrillCategory;

export default function DrillsScreen() {
  const { c } = useTheme();
  const router = useRouter();
  const drills = useDrillStore((s) => s.drills);
  const duplicate = useDrillStore((s) => s.duplicateDrill);
  const remove = useDrillStore((s) => s.deleteDrill);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [contextDrill, setContextDrill] = useState<Drill | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return drills
      .filter((d) => filter === 'all' || d.category === filter)
      .filter((d) => q === '' || d.name.toLowerCase().includes(q));
  }, [drills, filter, query]);

  const onLongPress = (d: Drill) => setContextDrill(d);

  const closeMenu = () => setContextDrill(null);

  const handleDelete = (d: Drill) => {
    closeMenu();
    Alert.alert(
      `Delete "${d.name}"?`,
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => remove(d.id),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScreenHeader title="Drills" subtitle={`${drills.length} total`} />

      <View style={[styles.search, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Search size={16} color={c.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search drills"
          placeholderTextColor={c.textMuted}
          style={[styles.searchInput, { color: c.textPrimary }]}
        />
      </View>

      <View style={styles.filterRow}>
        <Pill
          label="All"
          active={filter === 'all'}
          onPress={() => setFilter('all')}
        />
        {DRILL_CATEGORIES.map((cat) => (
          <Pill
            key={cat}
            label={cat[0]!.toUpperCase() + cat.slice(1)}
            active={filter === cat}
            onPress={() => setFilter(cat)}
          />
        ))}
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          title="No drills found"
          body="Try a different filter or create your own."
          cta={
            <Button
              label="Create drill"
              leftIcon={<Plus size={16} color="#fff" />}
              onPress={() => router.push('/drill/new')}
            />
          }
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(d) => d.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={{ gap: SPACING.sm }}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          renderItem={({ item }) => (
            <DrillCard
              drill={item}
              onPress={() => router.push(`/drill/${item.id}`)}
              onLongPress={() => onLongPress(item)}
            />
          )}
        />
      )}

      <Pressable
        onPress={() => router.push('/drill/new')}
        style={styles.fab}
      >
        <View style={styles.fabInner}>
          <Plus size={24} color="#fff" />
        </View>
      </Pressable>

      <Sheet
        visible={!!contextDrill}
        onClose={closeMenu}
        title={contextDrill?.name}
      >
        {contextDrill ? (
          <View style={{ gap: SPACING.xs }}>
            <Button
              label="Start session"
              fullWidth
              onPress={() => {
                closeMenu();
                router.push(`/drill/${contextDrill.id}`);
              }}
            />
            <Button
              label="Duplicate"
              variant="secondary"
              fullWidth
              onPress={() => {
                const copy = duplicate(contextDrill.id);
                closeMenu();
                if (copy) router.push(`/drill/${copy.id}`);
              }}
            />
            {contextDrill.isPreset ? null : (
              <>
                <Button
                  label="Edit"
                  variant="ghost"
                  fullWidth
                  onPress={() => {
                    const target = contextDrill;
                    closeMenu();
                    router.push({
                      pathname: '/drill/new',
                      params: { editId: target.id },
                    });
                  }}
                />
                <Button
                  label="Delete"
                  variant="destructive"
                  fullWidth
                  onPress={() => handleDelete(contextDrill)}
                />
              </>
            )}
          </View>
        ) : null}
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  search: {
    marginHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: RADIUS.md,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexWrap: 'wrap',
  },
  list: { paddingHorizontal: SPACING.md, paddingBottom: 160 },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: 96,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: COLORS.brand,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  fabInner: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.brand,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
