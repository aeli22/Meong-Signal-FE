import React, { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import MapUser from "../../components/Map/MapUser";
import { getCoordinates } from "../../apis/geolocation";
import { getDogInfo } from "../../apis/getDogInfo";

const MapStatus = ({ dogId }) => {
  const [initialLocation, setInitialLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [currentLocation, setCurrentLocation] = useState(initialLocation);
  const [dogName, setDogName] = useState(""); // 강아지 이름 상태 추가
  const [walkUserEmail, setWalkUserEmail] = useState("walking@gmail.com"); // 고정 산책자 이메일
  const [ownerEmail, setOwnerEmail] = useState("owner@gmail.com"); // 고정 견주 이메일
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    const fetchDogInfo = async () => {
      try {
        const data = await getDogInfo(`/dogs/${dogId}`);
        setDogName(data.dog.name);
      } catch (error) {
        console.error("Error fetching dog info:", error);
      }
    };

    fetchDogInfo();
  }, [dogId]);

  useEffect(() => {
    const fetchInitialCoordinates = async () => {
      try {
        const coordinates = await getCoordinates();
        setInitialLocation(coordinates);
        setCurrentLocation(coordinates);
        console.log(coordinates);
      } catch (error) {
        console.error("Error fetching initial coordinates:", error);
      }
    };

    fetchInitialCoordinates();
  }, []);

  useEffect(() => {
    const setupRoomAndSocket = async () => {
      try {
        await CreateRoom();
      } catch (error) {
        console.error("Error setting up room and socket:", error);
      }
    };

    setupRoomAndSocket();
  }, []); // 빈 배열로 두어 컴포넌트 마운트 시 한 번만 실행

  const CreateRoom = async () => {
    if (socket) {
      socket.close();
    }
    const token = localStorage.getItem("accessToken");
    const response = await fetch(
      "https://meong-signal.kro.kr/walk-status/rooms/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          owner_email: ownerEmail,
          walk_user_email: walkUserEmail,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const roomData = await response.json();
    setRoomId(roomData.id); // roomId 상태 업데이트

    console.log("roomId:", roomData.id);

    OpenOrCreateRoom(roomData.id);
  };

  const OpenOrCreateRoom = (roomId) => {
    SetUpWebSocket(roomId);
  };

  const SetUpWebSocket = (roomId) => {
    const newSocket = new WebSocket(
      `wss://meong-signal.kro.kr/ws/room/${roomId}/locations`,
    );

    newSocket.onopen = () => {
      console.log("WebSocket connected");
      setSocket(newSocket); // 연결되었을 때만 socket 상태 업데이트
    };

    newSocket.onmessage = (e) => {
      let data = JSON.parse(e.data);
      console.log("소켓에서 받아온 현재 강아지 위치:", data); // 여기서 받는 데이터가 강아지의 위치 데이터입니다.

      if (data.latitude && data.longitude) {
        setCurrentLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
        console.log("setCurrentLocation 수정");
      }
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    newSocket.onclose = () => {
      console.log("WebSocket closed");
      setSocket(null);
    };
  };

  return (
    <>
      <Header />
      <p>내 강아지 {dogName}가 산책 중 상태라면</p>
      산책 중인 유저 정보와 강아지 위치 조회
      <MapUser
        latitude={currentLocation.latitude}
        longitude={currentLocation.longitude}
        width="300px"
        height="300px"
      />
      <Footer />
    </>
  );
};

export default MapStatus;
