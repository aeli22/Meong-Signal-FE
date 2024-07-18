import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Rate from "../Rate/Rate";
import Image from "../Image/Image";

const ReviewCard = styled.div`
  padding: 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  font-family: "PretendardM";
  background-color: var(--pink-color1);
`;

const ReviewContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RateReview = ({ review }) => {
  return (
    <ReviewCard>
      <ReviewContent>
        <h3>{review.evaluated_user_name}</h3>
        <p>{review.content}</p>
        <Rate value={review.rating} readOnly />
      </ReviewContent>
      <Image
        src={review.evaluated_user_profile}
        alt={`${review.evaluated_user_name}`}
      />
    </ReviewCard>
  );
};

RateReview.propTypes = {
  review: PropTypes.shape({
    evaluated_user_profile: PropTypes.string.isRequired,
    evaluated_user_name: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
  }).isRequired,
};

export default RateReview;
