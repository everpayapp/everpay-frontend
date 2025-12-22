.bubble-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 9999;
}

.bubble {
  animation: bubble-pop 1.8s ease-out forwards;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 32px 48px;
  transform: scale(0);
}

.bubble-text {
  font-size: 2.4rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0px 0px 8px rgba(0,0,0,0.55);
}

@keyframes bubble-pop {
  0% {
    transform: scale(0.1);
    opacity: 0;
  }
  12% {
    transform: scale(1.15);
    opacity: 1;
  }
  30% {
    transform: scale(1);
  }
  80% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.9);
    opacity: 0;
  }
}
