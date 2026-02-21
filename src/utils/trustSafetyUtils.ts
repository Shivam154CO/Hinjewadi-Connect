import { Alert } from 'react-native';
import { ReportReason, ReportTargetType, Report, BlockedUser, TrustProfile } from '../types';

/**
 * Trust, Safety & Quality Utility
 * Report | Block | Verify | Spam Detection
 */

// ── Report reasons with labels & icons ──
export const REPORT_REASONS: { key: ReportReason; label: string; icon: string; description: string }[] = [
    { key: 'fake_listing', label: 'Fake Listing', icon: 'alert-circle-outline', description: 'This listing contains false information' },
    { key: 'spam', label: 'Spam', icon: 'email-alert-outline', description: 'Unsolicited or repetitive content' },
    { key: 'harassment', label: 'Harassment', icon: 'account-alert-outline', description: 'Threatening or abusive behavior' },
    { key: 'inappropriate_content', label: 'Inappropriate Content', icon: 'eye-off-outline', description: 'Contains offensive material' },
    { key: 'scam_fraud', label: 'Scam / Fraud', icon: 'shield-alert-outline', description: 'Attempting to defraud users' },
    { key: 'wrong_info', label: 'Wrong Information', icon: 'information-outline', description: 'Price, location, or details are incorrect' },
    { key: 'duplicate', label: 'Duplicate', icon: 'content-copy', description: 'This listing is posted multiple times' },
    { key: 'other', label: 'Other', icon: 'dots-horizontal-circle-outline', description: 'Something else not listed above' },
];

// ── Submit a report (mock — in production: POST /api/reports) ──
export const submitReport = async (
    reporterId: string,
    targetId: string,
    targetType: ReportTargetType,
    reason: ReportReason,
    description: string,
): Promise<Report> => {
    // Simulate network call
    await new Promise(resolve => setTimeout(resolve, 800));

    const report: Report = {
        id: `rpt_${Date.now()}`,
        reporterId,
        targetId,
        targetType,
        reason,
        description,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };

    // In production: await fetch('/api/reports', { method: 'POST', body: JSON.stringify(report) });
    console.log('[TrustSafety] Report submitted:', report);
    return report;
};

// ── Block a user (mock — in production: POST /api/users/:id/block) ──
export const blockUser = async (
    userId: string,
    blockedUserId: string,
    blockedName: string,
    blockedPhone: string,
    reason: string,
): Promise<BlockedUser> => {
    await new Promise(resolve => setTimeout(resolve, 600));

    const blocked: BlockedUser = {
        id: `blk_${Date.now()}`,
        userId,
        blockedUserId,
        blockedName,
        blockedPhone,
        reason,
        createdAt: new Date().toISOString(),
    };

    console.log('[TrustSafety] User blocked:', blocked);
    return blocked;
};

// ── Unblock a user ──
export const unblockUser = async (blockId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    console.log('[TrustSafety] User unblocked:', blockId);
};

// ── Check if user is blocked ──
let blockedUsers: BlockedUser[] = []; // In-memory store; production: from API/DB

export const isUserBlocked = (userId: string): boolean => {
    return blockedUsers.some(b => b.blockedUserId === userId);
};

export const getBlockedUsers = (): BlockedUser[] => [...blockedUsers];

export const addToBlockedList = (blocked: BlockedUser) => {
    blockedUsers.push(blocked);
};

export const removeFromBlockedList = (blockId: string) => {
    blockedUsers = blockedUsers.filter(b => b.id !== blockId);
};

// ── Spam detection (lightweight, client-side heuristics) ──
const SPAM_PATTERNS = [
    /(\b\d{10,}\b.*){3,}/gi,              // 3+ phone numbers
    /(earn|money|income|lakh|crore).*(easy|quick|fast|guaranteed)/gi,
    /(click|visit|open).*(link|url|website)/gi,
    /whatsapp.*(group|channel|join)/gi,
    /(free|win|winner|lottery|prize|reward)/gi,
    /(.)\1{5,}/gi,                          // Repeated chars (e.g., "aaaaaa")
];

const SPAM_WORDS = [
    'mlm', 'network marketing', 'bitcoin', 'crypto', 'forex', 'investment scheme',
    'part time job from home', 'earn from mobile', 'daily income', 'guaranteed return',
];

export interface SpamCheckResult {
    isSpam: boolean;
    confidence: number; // 0-1
    reasons: string[];
}

export const checkForSpam = (text: string): SpamCheckResult => {
    const reasons: string[] = [];
    let score = 0;

    // Check regex patterns
    SPAM_PATTERNS.forEach(pattern => {
        if (pattern.test(text)) {
            score += 0.25;
            reasons.push(`Pattern match: ${pattern.source.substring(0, 30)}...`);
        }
        pattern.lastIndex = 0; // Reset regex
    });

    // Check spam words
    const lowerText = text.toLowerCase();
    SPAM_WORDS.forEach(word => {
        if (lowerText.includes(word)) {
            score += 0.3;
            reasons.push(`Spam keyword: "${word}"`);
        }
    });

    // Check for excessive caps
    const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1);
    if (capsRatio > 0.6 && text.length > 20) {
        score += 0.15;
        reasons.push('Excessive capitalization');
    }

    // Check for excessive special chars
    const specialRatio = (text.match(/[!@#$%^&*()]/g) || []).length / Math.max(text.length, 1);
    if (specialRatio > 0.15) {
        score += 0.1;
        reasons.push('Excessive special characters');
    }

    const confidence = Math.min(score, 1);

    return {
        isSpam: confidence >= 0.5,
        confidence,
        reasons,
    };
};

// ── Trust Score calculation ──
export const calculateTrustScore = (profile: Partial<TrustProfile>): number => {
    let score = 50; // Start neutral

    // Verification bonus
    if (profile.verificationStatus === 'verified') score += 25;
    else if (profile.verificationStatus === 'pending') score += 5;

    // Ratings boost
    if (profile.averageRating && profile.totalReviews) {
        const ratingBoost = ((profile.averageRating - 3) / 2) * 15; // -15 to +15
        score += ratingBoost;
        if (profile.totalReviews > 10) score += 5;
        if (profile.totalReviews > 50) score += 5;
    }

    // Reports penalty
    if (profile.reportCount) {
        score -= profile.reportCount * 5;
    }

    // Spam penalty
    if (profile.spamFlags) {
        score -= profile.spamFlags * 10;
    }

    // Account age bonus (months since join)
    if (profile.joinedAt) {
        const months = (Date.now() - new Date(profile.joinedAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
        if (months > 3) score += 5;
        if (months > 12) score += 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
};

// ── Trust Score label ──
export const getTrustLabel = (score: number): { label: string; color: string; icon: string } => {
    if (score >= 80) return { label: 'Excellent', color: '#10B981', icon: 'shield-check' };
    if (score >= 60) return { label: 'Good', color: '#3B82F6', icon: 'shield-half-full' };
    if (score >= 40) return { label: 'Average', color: '#F59E0B', icon: 'shield-outline' };
    if (score >= 20) return { label: 'Low', color: '#EF4444', icon: 'shield-alert-outline' };
    return { label: 'Poor', color: '#7F1D1D', icon: 'shield-off-outline' };
};

// ── Confirm dialogs ──
export const confirmBlock = (
    name: string,
    onConfirm: () => void,
) => {
    Alert.alert(
        `Block ${name}?`,
        `You won't see listings or contact from ${name}. They won't be notified. You can unblock later from your Profile.`,
        [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Block', style: 'destructive', onPress: onConfirm },
        ],
    );
};

export const confirmUnblock = (
    name: string,
    onConfirm: () => void,
) => {
    Alert.alert(
        `Unblock ${name}?`,
        `You'll be able to see their listings and receive contact from them again.`,
        [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Unblock', onPress: onConfirm },
        ],
    );
};
