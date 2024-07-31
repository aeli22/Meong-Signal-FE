import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { getProfileImage } from "../../apis/chatApi";
import { formatTimestamp } from "../../utils/time";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale("ko");

const ChatRoomContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  background-color: ${(props) =>
    props.$read === "true" ? "var(--gray-color1)" : "var(--yellow-color1)"};
  width: 350px;
  font-family: "PretendardM";
  cursor: pointer; /* 클릭 가능하게 커서 변경 */
`;

const ProfileImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-right: 20px;
  object-fit: cover;
`;

const ChatInfo = styled.div`
  display: flex;
  flex-direction: column;
  color: black;
  flex: 1;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NicknameContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Nickname = styled.div`
  font-weight: bold;
  font-size: 18px;
`;

const RepresentativeBadge = styled.div`
  background-color: var(--white-color);
  border-radius: 4px;
  border: 2px solid var(--yellow-color2);
  padding: 4px 4px;
  margin-right: 8px;
  font-size: 14px;
  font-family: "PretendardM";
  margin-left: 5px;
`;

const LastMessage = styled.div`
  color: var(--black-color);
  margin: 10px 0;
  font-size: 14px;
  padding-left: 2px;
`;

const LastTimeStamp = styled.div`
  color: var(--gray-color3);
  font-size: 10px;
  text-align: right;
`;

const Chat = ({ room }) => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(
    room.other_user_profile_image || "",
  );

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const image = await getProfileImage(room.other_user_id);
        setProfileImage(image);
      } catch (error) {
        console.error("Error fetching profile image:", error);
      }
    };
    if (!room.other_user_profile_image) {
      fetchProfileImage();
    }
  }, [room.other_user_id, room.other_user_profile_image]);

  const handleClick = () => {
    navigate(`/chat/rooms/${room.id}`);
  };

  return (
    <ChatRoomContainer
      onClick={handleClick}
      $read={room.last_message_read.toString()}
    >
      <ProfileImage
        src={profileImage}
        alt={`${room.other_user_nickname}님의 프로필 사진`}
      />
      <ChatInfo>
        <ChatHeader>
          <NicknameContainer>
            {room.other_user_representative && (
              <RepresentativeBadge>
                👑{room.other_user_representative}
              </RepresentativeBadge>
            )}
            <Nickname>{room.other_user_nickname}</Nickname>
          </NicknameContainer>
        </ChatHeader>
        <LastMessage>
          {room.last_message_content || "대화 내용이 없습니다."}
        </LastMessage>
        <LastTimeStamp>
          {formatTimestamp(room.last_message_timestamp)}
        </LastTimeStamp>
      </ChatInfo>
    </ChatRoomContainer>
  );
};

Chat.propTypes = {
  room: PropTypes.shape({
    id: PropTypes.number.isRequired,
    other_user_profile_image: PropTypes.string,
    other_user_id: PropTypes.number.isRequired,
    other_user_nickname: PropTypes.string.isRequired,
    last_message_content: PropTypes.string,
    last_message_timestamp: PropTypes.string,
    last_message_read: PropTypes.bool.isRequired,
    other_user_representative: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.string,
    ]),
  }).isRequired,
};

export default Chat;
