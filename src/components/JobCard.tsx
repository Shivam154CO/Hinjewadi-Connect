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
                    <MaterialCommunityIcons name="briefcase-variant" size={18} color="#00C896" />
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
                    <MaterialCommunityIcons name="map-marker-outline" size={11} color="#636366" />
                    <Text style={s.detailText}>{job.area}</Text>
                </View>
                <View style={s.detailDot} />
                <View style={s.detailItem}>
                    <MaterialCommunityIcons name="clock-outline" size={11} color="#636366" />
                    <Text style={s.detailText}>{job.type}</Text>
                </View>
                <View style={s.detailDot} />
                <View style={s.detailItem}>
                    <MaterialCommunityIcons name="history" size={11} color="#636366" />
                    <Text style={s.detailText}>{job.postedAgo}</Text>
                </View>
            </View>

            <View style={s.footer}>
                <View>
                    <Text style={s.salaryLabel}>Monthly</Text>
                    <Text style={s.salaryValue}>{job.salary}</Text>
                </View>
                <TouchableOpacity style={s.callBtn} onPress={handleCall}>
                    <MaterialCommunityIcons name="phone" size={13} color="#000000" />
                    <Text style={s.callText}>Call Now</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const s = StyleSheet.create({
    card: {
        backgroundColor: '#1C1C1E', borderRadius: 12, padding: 12,
        marginBottom: 10,
        borderWidth: 1, borderColor: '#2C2C2E',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15, shadowRadius: 4, elevation: 2,
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    iconBox: {
        width: 36, height: 36, borderRadius: 8,
        backgroundColor: '#00C89620', alignItems: 'center', justifyContent: 'center',
    },
    titleBlock: { flex: 1, marginLeft: 10 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
    title: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', flex: 1, marginRight: 8 },
    urgentTag: { backgroundColor: '#FF453A20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    urgentText: { color: '#FF453A', fontSize: 8, fontWeight: '800' },
    company: { fontSize: 11, color: '#636366', fontWeight: '500' },
    detailRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#252527', paddingVertical: 6, paddingHorizontal: 10,
        borderRadius: 8, marginBottom: 10, gap: 5,
    },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    detailText: { fontSize: 10, fontWeight: '600', color: '#AEAEB2' },
    detailDot: { width: 2, height: 2, borderRadius: 1, backgroundColor: '#3A3A3C' },
    footer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#2C2C2E', paddingTop: 10,
    },
    salaryLabel: { fontSize: 9, color: '#636366', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    salaryValue: { fontSize: 15, fontWeight: '800', color: '#00C896', marginTop: 1 },
    callBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#00C896', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    },
    callText: { color: '#000000', fontSize: 12, fontWeight: '700' },
});
