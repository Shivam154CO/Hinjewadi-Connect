import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../theme/theme';
import { Job } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { executeContact } from '../utils/contactUtils';
import { jobService } from '../services/jobService';

interface JobCardProps {
    job: Job;
    onPress: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
    const handleCall = () => {
        jobService.incrementLeads(job.id).catch(() => { });
        executeContact('call', {
            name: job.company,
            phone: job.contactPhone,
            context: 'job',
            contextTitle: job.title,
            contextCompany: job.company,
        });
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.95}
        >
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="briefcase-variant" size={28} color="#4F46E5" />
                </View>
                <View style={styles.titleContent}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
                        {job.urgent && (
                            <View style={styles.urgentBadge}>
                                <Text style={styles.urgentText}>URGENT</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.company} numberOfLines={1}>{job.company}</Text>
                </View>
            </View>

            <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="map-marker-outline" size={14} color="#64748B" />
                    <Text style={styles.detailText}>{job.area}</Text>
                </View>
                <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color="#64748B" />
                    <Text style={styles.detailText}>{job.type}</Text>
                </View>
                <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="history" size={14} color="#64748B" />
                    <Text style={styles.detailText}>{job.postedAgo}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.salaryContainer}>
                    <Text style={styles.salaryLabel}>Monthly Salary</Text>
                    <Text style={styles.salaryValue}>{job.salary}</Text>
                </View>
                <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradient}
                    >
                        <MaterialCommunityIcons name="phone" size={18} color="#FFFFFF" />
                        <Text style={styles.callText}>Call Now</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...SHADOWS.medium,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleContent: {
        flex: 1,
        marginLeft: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontSize: 17,
        fontWeight: '800',
        color: '#1E293B',
        flex: 1,
        marginRight: 8,
    },
    urgentBadge: {
        backgroundColor: '#FEF2F2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    urgentText: {
        color: '#EF4444',
        fontSize: 10,
        fontWeight: '900',
    },
    company: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
    },
    detailsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 16,
        marginBottom: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 16,
    },
    salaryContainer: {
        flex: 1,
    },
    salaryLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    salaryValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1E293B',
    },
    callButton: {
        borderRadius: 14,
        overflow: 'hidden',
        ...SHADOWS.light,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
    },
    callText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
});
