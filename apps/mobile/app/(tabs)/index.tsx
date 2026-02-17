import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/auth-context';

export default function DashboardTab() {
    const { user } = useAuth();

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
            {/* Welcome */}
            <View style={styles.welcomeCard}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userName}>{user?.name || 'Auditor'}</Text>
            </View>

            {/* Quick actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
                <TouchableOpacity
                    style={[styles.actionCard, { backgroundColor: '#1e3a5f' }]}
                    onPress={() => router.push('/scan')}
                >
                    <View style={[styles.actionIcon, { backgroundColor: '#3b82f6' }]}>
                        <Ionicons name="qr-code-outline" size={28} color="#fff" />
                    </View>
                    <Text style={styles.actionTitle}>Scan QR</Text>
                    <Text style={styles.actionDesc}>Scan an asset tag</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionCard, { backgroundColor: '#1a3a2a' }]}
                    onPress={() => router.push('/(tabs)/audits')}
                >
                    <View style={[styles.actionIcon, { backgroundColor: '#22c55e' }]}>
                        <Ionicons name="clipboard-outline" size={28} color="#fff" />
                    </View>
                    <Text style={styles.actionTitle}>My Audits</Text>
                    <Text style={styles.actionDesc}>View audit reports</Text>
                </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Ionicons name="information-circle-outline" size={20} color="#60a5fa" />
                    <Text style={styles.infoText}>
                        Start by scanning a QR tag on an asset, or create an audit report for an assigned location.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    welcomeCard: {
        backgroundColor: '#1e293b', borderRadius: 16, padding: 24,
        marginBottom: 24, borderWidth: 1, borderColor: '#334155',
    },
    welcomeText: { color: '#94a3b8', fontSize: 14 },
    userName: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 4 },
    sectionTitle: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
    actionsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    actionCard: {
        flex: 1, borderRadius: 16, padding: 20,
        borderWidth: 1, borderColor: '#334155',
    },
    actionIcon: {
        width: 48, height: 48, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    actionTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
    actionDesc: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
    infoCard: {
        backgroundColor: '#1e293b', borderRadius: 12, padding: 16,
        borderWidth: 1, borderColor: '#334155',
    },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    infoText: { color: '#cbd5e1', fontSize: 13, lineHeight: 20, flex: 1 },
});
