// Dark mode JobCard
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Job } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
            name: job.company, phone: job.contactPhone,
            context: 'job', contextTitle: job.title, contextCompany: job.company,
        });
    };

    return (
        <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
            <View style={s.header}>
                <View style={s.iconBox}>
                    <MaterialCommunityIcons name="briefcase-variant" size={22} color="#00C896" />
                </View>
                <View style={s.titleBlock}>
                    <View style={s.titleRow}>
                        <Text style={s.title} numberOfLines={1}>{job.title}</Text>
                        {job.urgent && <View style={s.urgentTag}><Text style={s.urgentText}>URGENT</Text></View>}
                    </View>
                    <Text style={s.company} numberOfLines={1}>{job.company}</Text>
                </View>
            </View>

            <View style={s.detailRow}>
                <View style={s.detailItem}>
                    <MaterialCommunityIcons name="map-marker-outline" size={12} color="#636366" />
                    <Text style={s.detailText}>{job.area}</Text>
                </View>
                <View style={s.detailDot} />
                <View style={s.detailItem}>
                    <MaterialCommunityIcons name="clock-outline" size={12} color="#636366" />
                    <Text style={s.detailText}>{job.type}</Text>
                </View>
                <View style={s.detailDot} />
                <View style={s.detailItem}>
                    <MaterialCommunityIcons name="history" size={12} color="#636366" />
                    <Text style={s.detailText}>{job.postedAgo}</Text>
                </View>
            </View>

            <View style={s.footer}>
                <View>
                    <Text style={s.salaryLabel}>Monthly</Text>
                    <Text style={s.salaryValue}>{job.salary}</Text>
                </View>
                <TouchableOpacity style={s.callBtn} onPress={handleCall}>
                    <MaterialCommunityIcons name="phone" size={15} color="#000000" />
                    <Text style={s.callText}>Call Now</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const s = StyleSheet.create({
    card: {
        backgroundColor: '#1C1C1E', borderRadius: 20, padding: 16,
        marginBottom: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    iconBox: {
        width: 46, height: 46, borderRadius: 14,
        backgroundColor: '#00C89620', alignItems: 'center', justifyContent: 'center',
    },
    titleBlock: { flex: 1, marginLeft: 12 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
    title: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', flex: 1, marginRight: 8 },
    urgentTag: { backgroundColor: '#FF453A20', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
    urgentText: { color: '#FF453A', fontSize: 9, fontWeight: '800' },
    company: { fontSize: 12, color: '#636366', fontWeight: '500' },
    detailRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#252527', paddingVertical: 9, paddingHorizontal: 12,
        borderRadius: 12, marginBottom: 14, gap: 6,
    },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    detailText: { fontSize: 11, fontWeight: '600', color: '#AEAEB2' },
    detailDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#3A3A3C' },
    footer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#2C2C2E', paddingTop: 12,
    },
    salaryLabel: { fontSize: 10, color: '#636366', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    salaryValue: { fontSize: 17, fontWeight: '800', color: '#00C896', marginTop: 2 },
    callBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#00C896', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    },
    callText: { color: '#000000', fontSize: 13, fontWeight: '700' },
});
