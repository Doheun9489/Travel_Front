import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPinned, Notebook, Heart } from 'lucide-react';

import useUserStore from '../../store/userStore';

const SideMenu = ({ onClose }) => {
  const navigate = useNavigate();

  const nickname = useUserStore((state) => state.nickname);
  const profileImageUrl = useUserStore((state) => state.profileImageUrl);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const logout = useUserStore((state) => state.logout);
  const initializeFromStorage = useUserStore(
    (state) => state.initializeFromStorage
  );

  // 사이드 메뉴 열릴 때 스토리지 값 동기화
  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  const handleProfileEdit = () => {
    navigate('/edit/profile');
    onClose();
  };

  const handleTabClick = (tab) => {
    navigate(`/mypage?tab=${tab}`);
    onClose();
  };

  const goTo = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  return (
    <>
      {/* 오버레이 영역 */}

      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40"
        onClick={onClose}
      />

      {/* 사이드 메뉴 영역 */}
      <div className="fixed top-0 right-0 h-full w-4/5 bg-white z-50 shadow-lg transition-transform duration-300 p-4">
        {/* 닫기 버튼 */}
        <div className="flex justify-start">
          <button className="pt-3 pl-2" onClick={onClose}>
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* 내용 영역 */}
        <div className="px-2 mt-16 font-pretendard">
          {isLoggedIn ? (
            <>
              {/* 프로필 정보 */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-3/5">
                  <p className="font-noonnu">안녕하세요, {nickname}님</p>
                  <p
                    className="text-sm text-gray-500 cursor-pointer"
                    onClick={handleProfileEdit}
                  >
                    프로필편집 &gt;
                  </p>
                </div>
                <div className="w-2/5 flex justify-end">
                  <img
                    src={profileImageUrl}
                    alt="프로필 이미지"
                    className="w-20 h-20 object-cover rounded-full"
                  />
                </div>
              </div>

              {/* 탭 메뉴 (내 여행 / 내 일기 / 내 저장) */}
              <div className="flex justify-between items-center pt-7 pb-7 px-2 border-t border-b border-gray-200">
                <div
                  className="flex flex-col items-center gap-1"
                  onClick={() => handleTabClick('myTrip')}
                >
                  <MapPinned className="w-6 h-6" />
                  <span>내 여행</span>
                </div>
                <div
                  className="flex flex-col items-center gap-1"
                  onClick={() => handleTabClick('myDiary')}
                >
                  <Notebook className="w-6 h-6" />
                  <span>내 여행 일기</span>
                </div>
                <div
                  className="flex flex-col items-center gap-1"
                  onClick={() => handleTabClick('myBookmark')}
                >
                  <Heart className="w-6 h-6" />
                  <span>내 저장</span>
                </div>
              </div>

              {/* 기타 메뉴 */}
              <ul className="mt-7 space-y-4 text-sm text-gray-700">
                <li
                  className="flex justify-between items-center border-b pb-3"
                  onClick={() => goTo('/edit/profile')}
                >
                  프로필 편집 <span>&gt;</span>
                </li>
                <li
                  className="flex justify-between items-center border-b pb-3"
                  onClick={() => goTo('/mypage')}
                >
                  마이페이지 <span>&gt;</span>
                </li>
                <li
                  className="flex justify-between items-center border-b pb-3"
                  onClick={() => goTo('/tools')}
                >
                  여행 도구 <span>&gt;</span>
                </li>
                <li
                  className="flex justify-between items-center border-b pb-3 text-red-500"
                  onClick={handleLogout}
                >
                  로그아웃 <span>&gt;</span>
                </li>
              </ul>
            </>
          ) : (
            // 비로그인 상태
            <div className="text-center mt-10">
              <p
                className="font-bold text-lg pb-4 border-b cursor-pointer"
                onClick={handleLogin}
              >
                로그인 / 회원가입 <span>&gt;</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SideMenu;
