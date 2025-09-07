import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

import CommonModal from '../../components/modal/CommonModal';
import PrimaryButton from '../../components/common/PrimaryButton';
import profileDefault from '../../assets/profile_default.png';
import BackHeader from '../../components/header/BackHeader';
import { Eye, EyeOff } from 'lucide-react';
import DefaultLayout from '../../layouts/DefaultLayout';

import {
  checkEmail,
  sendAuthCode,
  verifyAuthCode,
  uploadProfileImage,
  registerUser,
} from '../../api';

const SignUpPage = () => {
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [allChecked, setAllChecked] = useState(false);

  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // loading flags
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [msg, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const handleAllAgreeChange = () => {
    const next = !allChecked;
    setAllChecked(next);
    setTerms(next);
    setPrivacy(next);
    setMarketing(next);
  };

  const passwordsMatch = confirmPassword && password === confirmPassword;
  const passwordsMismatch = confirmPassword && password !== confirmPassword;

  // 이메일 중복 확인 + 인증코드 발송
  const handleSendAuthCode = async () => {
    if (!email) {
      msg.warning('이메일을 입력해 주세요.');
      return;
    }

    try {
      setSendingCode(true);
      const hide = msg.loading('이메일 확인 중...', 0);
      const isDuplicate = await checkEmail({ email });
      if (isDuplicate) {
        hide();
        msg.error('이미 등록된 이메일입니다. 다른 이메일을 사용해 주세요.');
        setEmail('');
        return;
      }

      await sendAuthCode({ email });
      hide();
      msg.success('인증코드가 이메일로 전송되었습니다.');
      setIsCodeSent(true);
    } catch (error) {
      msg.error('이메일 확인 또는 인증코드 전송에 실패했습니다.');
    } finally {
      setSendingCode(false);
    }
  };

  // 인증코드 검증
  const handleVerifyAuthCode = async () => {
    if (!authCode) {
      msg.warning('인증코드를 입력해 주세요.');
      return;
    }
    try {
      setVerifyingCode(true);
      const hide = msg.loading('인증코드 확인 중...', 0);
      await verifyAuthCode({ token: authCode });
      hide();
      setIsEmailVerified(true);
      msg.success('이메일 인증이 완료되었습니다.');
    } catch (error) {
      msg.error(error?.response?.data?.message || '인증에 실패했습니다.');
    } finally {
      setVerifyingCode(false);
    }
  };

  // 프로필 이미지 업로드
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileImage(URL.createObjectURL(file));

    try {
      setUploading(true);
      const hide = msg.loading('이미지 업로드 중...', 0);
      const { success, imageUrl, error } = await uploadProfileImage(file);
      hide();
      if (success) {
        setProfileImageUrl(imageUrl || '');
        msg.success('이미지를 업로드했습니다.');
      } else {
        setProfileImage(null);
        setProfileImageUrl('');
        msg.error(error || '프로필 이미지 업로드에 실패했습니다.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSignUpSuccess = () => {
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    navigate('/login');
  };

  // 회원가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword || !userName || !userNickname) {
      msg.warning('모든 필수 정보를 입력해 주세요.');
      return;
    }
    if (password !== confirmPassword) {
      msg.warning('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!terms || !privacy) {
      msg.warning('필수 약관에 동의해 주세요.');
      return;
    }
    if (!isEmailVerified) {
      msg.warning('이메일 인증을 완료해 주세요.');
      return;
    }

    const payload = {
      email,
      password,
      userName,
      userNickname,
      userProfileImage: profileImageUrl || '',
    };

    try {
      setSubmitting(true);
      const hide = msg.loading('회원가입 처리 중...', 0);
      await registerUser(payload);
      hide();
      handleSignUpSuccess();
    } catch (error) {
      msg.error(
        error?.response?.data?.message || '회원가입 중 문제가 발생했습니다.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DefaultLayout>
      {contextHolder}
      <BackHeader title="회원가입" />
      <p className="font-noonnu font-semibold mb-4 text-center">반갑습니다!</p>
      <div className="flex justify-center mb-4">
        <div className="flex flex-col items-center">
          <img
            key={profileImage}
            src={profileImage || profileDefault}
            alt="기본 프로필"
            className="w-20 h-20 rounded-full bg-white object-cover"
          />
          <label className="text-blue-500 mt-1 text-sm cursor-pointer">
            {uploading ? '업로드 중...' : '업로드'}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto px-4">
        <form onSubmit={handleSubmit}>
          {/* 이메일 */}
          <label className="block text-sm font-medium mb-1">
            이메일 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해 주세요."
              className="border w-full px-3 py-2 rounded text-sm"
              disabled={sendingCode || submitting}
            />
            <button
              type="button"
              onClick={handleSendAuthCode}
              className="text-sm border px-3 py-2 rounded text-blue-500 whitespace-nowrap disabled:opacity-60"
              disabled={!email || sendingCode || submitting}
            >
              {sendingCode ? '전송 중...' : '이메일 중복 확인'}
            </button>
          </div>

          {/* 인증코드 */}
          {isCodeSent && (
            <>
              <label className="block text-sm font-medium mb-1">
                인증코드 입력 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="인증코드를 입력해 주세요."
                  className="border w-full px-3 py-2 rounded text-sm"
                  disabled={verifyingCode || submitting}
                />
                <button
                  type="button"
                  onClick={handleVerifyAuthCode}
                  className="text-sm border px-3 py-2 rounded text-blue-500 whitespace-nowrap disabled:opacity-60"
                  disabled={!authCode || verifyingCode || submitting}
                >
                  {verifyingCode ? '확인 중...' : '인증하기'}
                </button>
              </div>
            </>
          )}

          {/* 비밀번호 */}
          <label className="block text-sm font-medium mb-1">
            비밀번호 <span className="text-red-500">*</span>
          </label>
          <div className="relative mb-3">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호를 입력해 주세요."
              className="border w-full px-3 py-2 rounded text-sm pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
              disabled={submitting}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* 비밀번호 확인 */}
          <label className="block text-sm font-medium mb-1">
            비밀번호 확인 <span className="text-red-500">*</span>
          </label>
          <div className="relative mb-1">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="비밀번호를 다시 입력해 주세요."
              className="border w-full px-3 py-2 rounded text-sm pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={submitting}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {passwordsMismatch && (
            <p className="text-sm text-red-500">
              비밀번호가 일치하지 않습니다.
            </p>
          )}
          {passwordsMatch && (
            <p className="text-sm text-green-600">비밀번호가 일치합니다!</p>
          )}

          {/* 이름 */}
          <label className="block text-sm font-medium mt-4 mb-1">
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="이름을 입력해 주세요."
            className="border w-full px-3 py-2 rounded text-sm mb-3"
            disabled={submitting}
          />

          {/* 닉네임 */}
          <label className="block text-sm font-medium mb-1">
            닉네임 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={userNickname}
            onChange={(e) => setUserNickname(e.target.value)}
            placeholder="닉네임을 입력해 주세요."
            className="border w-full px-3 py-2 rounded text-sm mb-5"
            disabled={submitting}
          />

          {/* 약관 */}
          <div className="border-t border-gray-200 my-4" />
          <div className="text-sm font-medium mb-2">이용 약관</div>
          <div className="mb-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={handleAllAgreeChange}
                disabled={submitting}
              />
              모두 동의합니다
            </label>
          </div>
          <div className="space-y-2 text-sm pl-5">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                disabled={submitting}
              />
              [필수] 이용약관{' '}
              <span className="text-blue-500 cursor-pointer">[보기]</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={privacy}
                onChange={(e) => setPrivacy(e.target.checked)}
                disabled={submitting}
              />
              [필수] 개인정보 수집 이용 동의{' '}
              <span className="text-blue-500 cursor-pointer">[보기]</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                disabled={submitting}
              />
              [선택] 마케팅 정보 수신 동의
            </label>
          </div>

          <div className="mt-6">
            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? '가입 중...' : '여담 가입하기'}
            </PrimaryButton>
          </div>
        </form>
      </div>

      <CommonModal
        isOpen={isModalOpen}
        message={`여담의 여행자가 되신 걸 진심으로 환영합니다.\n 로그인을 진행해 주세요! \n이제, 여행 준비는 저희가 도와드릴게요 🎉`}
        onConfirm={handleConfirm}
      />
    </DefaultLayout>
  );
};

export default SignUpPage;
