import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

export type UserRole = 'tenant' | 'worker' | 'employer' | null;

// Listing category for employer role - what type of listings they can post
export type ListingCategory = 'property' | 'job' | 'both' | null;

export interface UserProfile {
    id: string;
    name: string;
    phone?: string;
    role: UserRole;
    listingCategory: ListingCategory; // For employer role - what they can post
    area: string; // Phase 1, 2, or 3
    photoUrl?: string;
    email?: string;
    availability?: 'Available' | 'Busy';
}

export type AuthStackParamList = {
    Splash: undefined;
    Login: undefined;
    RoleSelection: undefined;
    ProfileCreation: {
        role: UserRole;
        listingCategory?: ListingCategory;
        workerType?: 'service' | 'job_seeker';
    };
};

export type MainStackParamList = {
    MainTabs: undefined;
    RoomDetail: { roomId: string };
    JobDetail: { jobId: string };
    PostListing: undefined;
    ServiceProviderDetail: { providerId: string };
    CreateServiceProfile: undefined;
    CreateJobProfile: undefined;
    ManagePosts: undefined;
    HelpSupport: undefined;
    Legal: undefined;
    ChatRoom: { chatId: string, name: string };
};

export type MainTabParamList = {
    Home: undefined;
    Rooms: undefined;
    Jobs: undefined;
    Services: undefined;
    Inbox: undefined;
    Profile: undefined;
};

// Common navigation typing helpers
export type AuthScreenProps<T extends keyof AuthStackParamList> =
    NativeStackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
    CompositeScreenProps<
        BottomTabScreenProps<MainTabParamList, T>,
        NativeStackScreenProps<MainStackParamList>
    >;

export type MainStackScreenProps<T extends keyof MainStackParamList> =
    NativeStackScreenProps<MainStackParamList, T>;

export interface Room {
    id: string;
    ownerId: string;
    title: string;
    description: string;
    price: number;
    deposit: number;
    area: string;
    type: 'Room' | 'PG' | 'Flat';
    furnishing: 'Unfurnished' | 'Semi-furnished' | 'Fully-furnished';
    genderPreference: 'Male' | 'Female' | 'Any';
    amenities: string[];
    images: string[];
    status: 'Available' | 'Occupied';
    contactPhone: string;
    createdAt: string;
    viewsCount?: number;
    leadsCount?: number;
}

export type JobCategory = string;

export interface Job {
    id: string;
    employerId: string;
    title: string;
    category: JobCategory;
    company: string;
    description: string;
    salary: string;
    area: string;
    type: 'Full Time' | 'Part Time';
    experience: string;
    contactPhone: string;
    postedAgo: string;
    urgent: boolean;
    requirements: string[];
    benefits: string[];
    viewsCount?: number;
    leadsCount?: number;
}

export interface JobSeekerProfile {
    id: string;
    name: string;
    phone: string;
    category: JobCategory;
    skills: string[];
    experience: string;
    expectedSalary: string;
    area: string;
    availability: 'Immediately' | 'Within 1 Week' | 'Within 1 Month';
    description: string;
    createdAt: string;
}

export type ServiceCategory = string;

export interface ServiceProvider {
    id: string;
    userId?: string;
    name: string;
    phone: string;
    whatsapp?: string;
    category: ServiceCategory;
    experience: string;
    rating: number;
    totalRatings: number;
    areas: string[]; // Phases served
    availability: 'Available' | 'Busy' | 'Paused';
    workingHours: string;
    description: string;
    skills: string[];
    priceRange: string;
    avatarColor: string;
    initial: string;
    reviews: ServiceReview[];
    createdAt: string;
    viewsCount?: number;
    leadsCount?: number;
}

export interface ServiceReview {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
}

// ── TRUST, SAFETY & QUALITY ──

export type ReportReason =
    | 'fake_listing'
    | 'spam'
    | 'harassment'
    | 'inappropriate_content'
    | 'scam_fraud'
    | 'wrong_info'
    | 'duplicate'
    | 'other';

export type ReportTargetType = 'room' | 'job' | 'service' | 'user';

export interface Report {
    id: string;
    reporterId: string;
    targetId: string;
    targetType: ReportTargetType;
    reason: ReportReason;
    description: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    createdAt: string;
}

export interface BlockedUser {
    id: string;
    userId: string;
    blockedUserId: string;
    blockedName: string;
    blockedPhone: string;
    reason: string;
    createdAt: string;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface TrustProfile {
    userId: string;
    verificationStatus: VerificationStatus;
    verifiedAt?: string;
    trustScore: number; // 0-100
    totalReviews: number;
    averageRating: number;
    reportCount: number;         // reports against this user
    reportsFiled: number;        // reports this user has filed
    joinedAt: string;
    isBlocked: boolean;
    spamFlags: number;
}

export interface SpamFlag {
    id: string;
    contentId: string;
    contentType: ReportTargetType;
    reason: string;
    confidence: number; // 0-1, ML-based
    flaggedAt: string;
    resolved: boolean;
}
