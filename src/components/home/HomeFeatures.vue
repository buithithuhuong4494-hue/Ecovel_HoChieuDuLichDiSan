<template>
  <section class="home-features">
    <div class="home-section-heading">
      <span class="home-tag">
        KHÁM PHÁ ECOVEL
      </span>

      <h2>
        Bắt đầu hành trình của bạn
      </h2>

      <p>
        Chọn hành trình, khám phá địa điểm,
        check-in và lưu lại từng dấu ấn cùng ECOVEL.
      </p>
    </div>

    <div class="home-feature-grid">
      <RouterLink
        to="/journeys"
        class="home-feature-card"
      >
        <span class="feature-number">
          01
        </span>

        <span class="feature-icon">
          🧭
        </span>

        <h3>
          Hành trình
        </h3>

        <p>
          Khám phá các hành trình di sản
          được thiết kế theo từng chủ đề.
        </p>

        <span class="feature-link">
          Xem hành trình →
        </span>
      </RouterLink>

      <RouterLink
        to="/locations"
        class="home-feature-card"
      >
        <span class="feature-number">
          02
        </span>

        <span class="feature-icon">
          📍
        </span>

        <h3>
          Địa điểm
        </h3>

        <p>
          Tìm hiểu những điểm đến văn hóa
          và di sản nổi bật.
        </p>

        <span class="feature-link">
          Khám phá địa điểm →
        </span>
      </RouterLink>

      <RouterLink
        to="/checkin"
        class="home-feature-card"
      >
        <span class="feature-number">
          03
        </span>

        <span class="feature-icon">
          ✓
        </span>

        <h3>
          Check-in
        </h3>

        <p>
          Xác nhận vị trí và lưu lại
          những nơi bạn đã đặt chân đến.
        </p>

        <span class="feature-link">
          Check-in ngay →
        </span>
      </RouterLink>

      <RouterLink
        to="/achievements"
        class="home-feature-card"
      >
        <span class="feature-number">
          04
        </span>

        <span class="feature-icon">
          🏅
        </span>

        <h3>
          Thành tựu
        </h3>

        <p>
          Hoàn thành cột mốc và mở khóa
          những huy hiệu trên hành trình.
        </p>

        <span class="feature-link">
          Xem thành tựu →
        </span>
      </RouterLink>
    </div>
  </section>
</template>