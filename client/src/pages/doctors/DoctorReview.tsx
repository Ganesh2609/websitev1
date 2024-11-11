import { useState, useEffect } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";


interface Review {
  fname: string;
  lname: string;
  feedback: string;
}

interface Reviews {
  positive: Review[];
  neutral: Review[];
  negative: Review[];
}

export default function DoctorReview() {
  const {
    isOpen: isPositiveOpen,
    onOpen: onPositiveOpen,
    onClose: onPositiveClose,
    onOpenChange: onPositiveOpenChange
  } = useDisclosure();
  const {
    isOpen: isNegativeOpen,
    onOpen: onNegativeOpen,
    onClose: onNegativeClose,
    onOpenChange: onNegativeOpenChange
  } = useDisclosure();
  const {
    isOpen: isNeutralOpen,
    onOpen: onNeutralOpen,
    onClose: onNeutralClose,
    onOpenChange: onNeutralOpenChange
  } = useDisclosure();

  const [reviews, setReviews] = useState<Reviews>({
    positive: [],
    neutral: [],
    negative: []
  });

  const getReviews = async () => {
    const doctorId = localStorage.getItem("doctor_id");
    try {
      const response = await fetch(`http://localhost:5000/api/review/${doctorId}`);
      if (response.ok) {
        const result: Reviews = await response.json();
        setReviews(result);
      } else {
        console.error("Failed to fetch reviews");
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  useEffect(() => {
    getReviews();
    const interval = setInterval(() => {
      getReviews();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <Button variant="flat" color="success" onPress={onPositiveOpen}>
        Positive Reviews ({reviews.positive.length})
      </Button>
      <Button variant="flat" onPress={onNeutralOpen}>
        Neutral Reviews ({reviews.neutral.length})
      </Button>
      <Button variant="flat" color="danger" onPress={onNegativeOpen}>
        Negative Reviews ({reviews.negative.length})
      </Button>

      {/* Modal for positive reviews */}
      <Modal isOpen={isPositiveOpen} onOpenChange={onPositiveOpenChange} scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex justify-between w-full">Positive Reviews</ModalHeader>
          <ModalBody>
            {reviews.positive.length > 0 ? (
              reviews.positive.map((review, index) => (
                <div key={index} style={{ marginBottom: '1em', padding: '1em', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 'bold' }}>
                    {review.fname} {review.lname}
                  </div>
                  <div style={{ marginTop: '0.5em' }}>
                    {review.feedback}
                  </div>
                </div>
              ))
            ) : (
              <p>No positive reviews available.</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onPositiveClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for neutral reviews */}
      <Modal isOpen={isNeutralOpen} onOpenChange={onNeutralOpenChange} scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex justify-between w-full">Neutral Reviews</ModalHeader>
          <ModalBody>
            {reviews.neutral.length > 0 ? (
              reviews.neutral.map((review, index) => (
                <div key={index} style={{ marginBottom: '1em', padding: '1em', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 'bold' }}>
                    {review.fname} {review.lname}
                  </div>
                  <div style={{ marginTop: '0.5em' }}>
                    {review.feedback}
                  </div>
                </div>
              ))
            ) : (
              <p>No neutral reviews available.</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onNeutralClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for negative reviews */}
      <Modal isOpen={isNegativeOpen} onOpenChange={onNegativeOpenChange} scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex justify-between w-full">Negative Reviews</ModalHeader>
          <ModalBody>
            {reviews.negative.length > 0 ? (
              reviews.negative.map((review, index) => (
                <div key={index} style={{ marginBottom: '1em', padding: '1em', border: '1px solid #ddd', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 'bold' }}>
                    {review.fname} {review.lname}
                  </div>
                  <div style={{ marginTop: '0.5em' }}>
                    {review.feedback}
                  </div>
                </div>
              ))
            ) : (
              <p>No negative reviews available.</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onNegativeClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
