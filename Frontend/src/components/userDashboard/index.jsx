import { useEffect, useState } from 'react';
import styles from './index.module.css';
import axios from 'axios';
import defaultAvatar from '/default-avatar.avif'
import UpdateProfile from '../updateProfile';
import API_CONFIG from '../../config/api.config';

export default function UserDashboard(){
    const[donationsList, setDonationsList]=useState([]);
    const[user, setUser]=useState(null);
    const[isLoading, setIsLoading] = useState(true);
    const [isUpdateProfileOpen, setIsUpdateProfileOpen] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(()=>{
        fetchUserData();
        fetchDonations();
    },[])

    const fetchUserData = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${API_CONFIG.ENDPOINTS.USER.PROFILE}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('User data:', response.data);
            if (response.data.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Error fetching user data:', error.message);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDonations = async () => {
        try {
            const response = await axios.get(`${API_CONFIG.ENDPOINTS.DONATIONS.LIST}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Donations data:', response.data);
            setDonationsList(response.data);
        } catch (error) {
            console.error('Error fetching donations:', error.message);
            setDonationsList([]);
        }
    };

    const getProfileImageUrl = () => {
        console.log('Current user:', user);
        if (!user || !user.profileUrl) {
            console.log('No profile URL, using default avatar');
            return defaultAvatar;
        }

        // If the URL is already absolute, use it directly
        if (user.profileUrl.startsWith('http')) {
            console.log('Using absolute URL:', user.profileUrl);
            return user.profileUrl;
        }

        // If it's a relative URL, construct the full URL
        const fullUrl = `${API_CONFIG.BASE_URL}${user.profileUrl}`;
        console.log('Constructed full URL:', fullUrl);
        return fullUrl;
    };

    const handleProfileUpdate = (updatedUser) => {
        console.log('Profile updated:', updatedUser);
        setUser(updatedUser);
        // Refresh the user data to ensure we have the latest profile image
        fetchUserData();
    };

    return(
        <div className={styles.mainContainer}>
            <div className={styles.dashboardContainer}>
                {/* Left Column - Profile Section */}
                <div className={styles.profileSection}>
                    <div className={styles.profileImageContainer}>
                        {isLoading ? (
                            <div className={styles.loadingPlaceholder}>Loading...</div>
                        ) : (
                            <img 
                                src={getProfileImageUrl()}
                                alt={user ? `${user.fName || 'User'}'s profile` : 'User profile'} 
                                className={styles.profileImage}
                                onError={(e) => {
                                    console.log('Image load error, using default avatar');
                                    e.target.onerror = null;
                                    e.target.src = defaultAvatar;
                                }}
                            />
                        )}
                    </div>
                    
                    <div className={styles.userName}>
                        <span className={styles.title}>
                            {isLoading ? 'Loading...' : (user?.gender === 'male' ? 'Mr.' : 'Ms.')}
                        </span>
                        <span className={styles.name}>
                            {isLoading ? 'Loading...' : (user ? `${user.fName || ''} ${user.lName || ''}` : 'User')}
                        </span>
                    </div>

                    <div className={styles.privateInfo}>
                        <div className={styles.infoBox}>
                            <p className={styles.infoItem}>{isLoading ? 'Loading...' : (user?.email || 'Not provided')}</p>
                            <p className={styles.infoItem}>
                                {isLoading ? 'Loading...' : (user?.phone ? `+${user.phone}` : 'Not provided')}
                            </p>
                        </div>
                        <p className={styles.privacyNote}>This information is private and is only visible to you</p>
                    </div>

                    <button 
                        className={styles.updateProfileButton}
                        onClick={() => setIsUpdateProfileOpen(true)}
                    >
                        Update Profile
                    </button>
                </div>

                {/* Right Column - Content Section */}
                <div className={styles.contentSection}>
                    <div className={styles.donationsTable}>
                        <h3>Sponsorship History</h3>
                        {isLoading ? (
                            <div className={styles.loadingPlaceholder}>Loading donations...</div>
                        ) : donationsList.length > 0 ? (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Sr.</th>
                                        <th>Students</th>
                                        <th>Current Status</th>
                                        <th>Amount</th>
                                    </tr> 
                                </thead>
                                <tbody>
                                    {donationsList.map((donation, index)=>(
                                        <tr key={donation._id} className={styles.tableRow}>
                                            <td className={styles.srNoColumn}>{index+1}</td>
                                            <td>
                                                <span>
                                                    {donation.donationTo ? 
                                                        `${donation.donationTo.firstName} ${donation.donationTo.lastName}` : 
                                                        'Student not found'}
                                                </span>
                                            </td>
                                            <td><span>{donation.status || 'NA'}</span></td>
                                            <td><span>${donation.Amount || 'NA'}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className={styles.noData}>No donations found</div>
                        )}
                    </div>

                    <div className={styles.statsContainer}>
                        <div className={styles.statBox}>
                            <p>Number Of Donations</p>
                            <p className={styles.statValue}>{donationsList.length}</p>
                        </div>
                        <div className={styles.statBox}>
                            <p>Number Of Students Sponsored</p>
                            <p className={styles.statValue}>
                                {new Set(donationsList.map(d => d.donationTo?._id)).size}
                            </p>
                        </div>
                        <div className={styles.statBox}>
                            <p>Total Amount Donated</p>
                            <p className={styles.statValue}>
                                ${donationsList.reduce((sum, donation) => sum + (donation.Amount || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Update Profile Popup */}
            <UpdateProfile 
                isOpen={isUpdateProfileOpen}
                onClose={() => setIsUpdateProfileOpen(false)}
                onUpdate={handleProfileUpdate}
                userId={user?._id}
            />
        </div>
    );
}