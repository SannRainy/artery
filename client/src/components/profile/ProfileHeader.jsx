// client/src/components/profile/ProfileHeader.jsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContexts';
import Button from '../ui/Button';
import { getImageUrl } from '../../utils/helpers';
import { toggleFollowUser } from '../../lib/api/profile';
import { FiHome, FiEdit2 } from 'react-icons/fi';

const ProfileHeader = ({ userProfile, setUserProfile, onEdit }) => {
  const { user: currentUser } = useAuth();

  if (!userProfile) return null;

  const isCurrentUser = currentUser?.id === userProfile.id;
  const isFollowing = userProfile.is_following;

  const handleToggleFollow = async () => {
    if (!currentUser) return;
    const originalProfile = { ...userProfile };
    const optimisticUser = {
      ...userProfile,
      is_following: !isFollowing,
      followersCount: isFollowing
        ? userProfile.followersCount - 1
        : userProfile.followersCount + 1,
    };
    setUserProfile(optimisticUser);
    try {
      const data = await toggleFollowUser(userProfile.id);
      setUserProfile(prev => ({
        ...prev,
        is_following: data.following,
        followersCount: data.follower_count,
      }));
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      setUserProfile(originalProfile);
    }
  };

  return (
    <div className="bg-white shadow-sm p-4 md:p-6 rounded-lg">
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={getImageUrl(userProfile.avatar_url, '/img/default-avatar.png')}
            alt={userProfile.username}
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
        <div className="flex-grow text-center sm:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{userProfile.fullname || userProfile.username}</h1>
          <p className="text-sm text-gray-500">@{userProfile.username}</p>
          <p className="mt-2 text-gray-600 max-w-lg mx-auto sm:mx-0">{userProfile.bio || 'No bio yet.'}</p>
          <div className="mt-4 flex justify-center sm:justify-start space-x-6 text-sm">
            <div className="text-center">
              <span className="font-bold block text-lg">{userProfile.pins_count || 0}</span>
              <span className="text-gray-500">Pins</span>
            </div>
            <div className="text-center">
              <span className="font-bold block text-lg">{userProfile.follower_count || 0}</span>
              <span className="text-gray-500">Followers</span>
            </div>
            <div className="text-center">
              <span className="font-bold block text-lg">{userProfile.following_count || 0}</span>
              <span className="text-gray-500">Following</span>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 mt-4 sm:mt-0">
          {isCurrentUser ? (
            <div className="flex items-center space-x-8">
              <Link href="/" passHref>
                <Button as="a" variant="light-outline">
                  <FiHome className="w-4 h-4 mr-2" />
                  Beranda
                </Button>
              </Link>
              <Button variant="danger" onClick={onEdit}>
                <FiEdit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          ) : (
            <Button
              variant={isFollowing ? 'secondary' : 'primary'}
              onClick={handleToggleFollow}
              disabled={!currentUser}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;