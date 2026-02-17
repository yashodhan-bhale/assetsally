import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { mobileApi } from '../../lib/api';

const statusConfig: Record<string, { color: string; icon: string; label: string }> = {
    DRAFT: { color: '#94a3b8', icon: 'create-outline', label: 'Draft' },
    SUBMITTED: { color: '#f59e0b', icon: 'time-outline', label: 'Submitted' },
    APPROVED: { color: '#22c55e', icon: 'checkmark-circle-outline', label: 'Approved' },
    REJECTED: { color: '#ef4444', icon: 'close-circle-outline', label: 'Rejected' },
};

export default function AuditDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadReport();
    }, [id]);

    const loadReport = async () => {
        try {
            const data = await mobileApi.getAudit(id!);
            setReport(data);
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
        setLoading(false);
    };

    const handleSubmit = async () => {
        Alert.alert(
            'Submit Report',
            'Are you sure you want to submit this report for review?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Submit', style: 'default',
                    onPress: async () => {
                        setSubmitting(true);
                        try {
                            await mobileApi.submitReport(id!);
                            await loadReport();
                            Alert.alert('Success', 'Report submitted for review');
                        } catch (err: any) {
                            Alert.alert('Error', err.message);
                        }
                        setSubmitting(false);
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (!report) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.errorText}>Report not found</Text>
            </View>
        );
    }

    const sc = statusConfig[report.status] || statusConfig.DRAFT;

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
            {/* Header */}
            <View style={styles.headerCard}>
                <Text style={styles.locationName}>{report.location?.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: sc.color + '20' }]}>
                    <Ionicons name={sc.icon as any} size={16} color={sc.color} />
                    <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
                </View>
            </View>

            {/* Info */}
            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Auditor</Text>
                    <Text style={styles.infoValue}>{report.auditor?.name}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Created</Text>
                    <Text style={styles.infoValue}>{new Date(report.createdAt).toLocaleDateString()}</Text>
                </View>
                {report.submittedAt && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Submitted</Text>
                        <Text style={styles.infoValue}>{new Date(report.submittedAt).toLocaleDateString()}</Text>
                    </View>
                )}
                {report.reviewNotes && (
                    <View style={styles.notesBox}>
                        <Ionicons name="chatbubble-outline" size={14} color="#64748b" />
                        <Text style={styles.notesText}>{report.reviewNotes}</Text>
                    </View>
                )}
            </View>

            {/* Findings */}
            <Text style={styles.sectionTitle}>
                Findings ({report.findings?.length || 0})
            </Text>
            {report.findings?.length ? (
                report.findings.map((f: any, i: number) => (
                    <View key={f.id || i} style={styles.findingCard}>
                        <View style={styles.findingHeader}>
                            <Text style={styles.findingItemName}>{f.item?.name || 'Unknown Item'}</Text>
                            <View style={[styles.conditionBadge, {
                                backgroundColor: f.condition === 'GOOD' ? '#22c55e20' :
                                    f.condition === 'DAMAGED' ? '#ef444420' : '#f59e0b20'
                            }]}>
                                <Text style={[styles.conditionText, {
                                    color: f.condition === 'GOOD' ? '#22c55e' :
                                        f.condition === 'DAMAGED' ? '#ef4444' : '#f59e0b'
                                }]}>{f.condition}</Text>
                            </View>
                        </View>
                        {f.notes && <Text style={styles.findingNotes}>{f.notes}</Text>}
                    </View>
                ))
            ) : (
                <View style={styles.emptyFindings}>
                    <Ionicons name="search-outline" size={32} color="#475569" />
                    <Text style={styles.emptyText}>No findings recorded yet</Text>
                </View>
            )}

            {/* Actions */}
            {report.status === 'DRAFT' && (
                <View style={styles.actionsSection}>
                    <TouchableOpacity style={styles.scanBtn} onPress={() => router.push('/scan')}>
                        <Ionicons name="qr-code-outline" size={20} color="#fff" />
                        <Text style={styles.scanBtnText}>Scan Asset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="send-outline" size={20} color="#fff" />
                                <Text style={styles.submitBtnText}>Submit for Review</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    center: { justifyContent: 'center', alignItems: 'center' },
    errorText: { color: '#ef4444', fontSize: 16 },
    headerCard: {
        backgroundColor: '#1e293b', borderRadius: 16, padding: 20,
        borderWidth: 1, borderColor: '#334155', marginBottom: 16,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    locationName: { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1 },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    },
    statusText: { fontSize: 12, fontWeight: '600' },
    infoCard: {
        backgroundColor: '#1e293b', borderRadius: 14, padding: 16,
        borderWidth: 1, borderColor: '#334155', marginBottom: 20, gap: 8,
    },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
    infoLabel: { color: '#64748b', fontSize: 13 },
    infoValue: { color: '#fff', fontSize: 13, fontWeight: '500' },
    notesBox: {
        flexDirection: 'row', gap: 8, backgroundColor: '#0f172a',
        borderRadius: 10, padding: 12, marginTop: 4,
    },
    notesText: { color: '#cbd5e1', fontSize: 13, flex: 1 },
    sectionTitle: {
        color: '#94a3b8', fontSize: 13, fontWeight: '600',
        marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1,
    },
    findingCard: {
        backgroundColor: '#1e293b', borderRadius: 12, padding: 14,
        borderWidth: 1, borderColor: '#334155', marginBottom: 8,
    },
    findingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    findingItemName: { color: '#fff', fontSize: 14, fontWeight: '500', flex: 1 },
    conditionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    conditionText: { fontSize: 11, fontWeight: '600' },
    findingNotes: { color: '#94a3b8', fontSize: 12, marginTop: 6 },
    emptyFindings: {
        backgroundColor: '#1e293b', borderRadius: 14, padding: 32,
        alignItems: 'center', borderWidth: 1, borderColor: '#334155', marginBottom: 16,
    },
    emptyText: { color: '#94a3b8', fontSize: 14, marginTop: 8 },
    actionsSection: { gap: 10, marginTop: 8 },
    scanBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, backgroundColor: '#3b82f6', padding: 14, borderRadius: 12,
    },
    scanBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
    submitBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, backgroundColor: '#22c55e', padding: 14, borderRadius: 12,
    },
    submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
