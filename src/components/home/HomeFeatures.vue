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
        Khám phá di sản, check-in địa điểm và lưu lại hành trình của riêng bạn.
      </p>
    </div>

    <div class="home-feature-grid">
      <RouterLink
        to="/journeys"
        class="home-feature-card"
      >
        <span class="feature-number">01</span>

        <h3>
          Hành trình khám phá
        </h3>

        <p>
          Khám phá các hành trình di sản được thiết kế theo từng chủ đề.
        </p>

        <span class="feature-link">
          Xem hành trình →
        </span>
      </RouterLink>

      <RouterLink
        to="/locations"
        class="home-feature-card"
      >
        <span class="feature-number">02</span>

        <h3>
          Địa điểm
        </h3>

        <p>
          Khám phá những địa điểm văn hóa và di sản nổi bật.
        </p>

        <span class="feature-link">
          Xem địa điểm →
        </span>
      </RouterLink>

      <RouterLink
        to="/checkin"
        class="home-feature-card"
      >
        <span class="feature-number">03</span>

        <h3>
          Check-in
        </h3>

        <p>
          Xác nhận vị trí và lưu lại những địa điểm bạn đã khám phá.
        </p>

        <span class="feature-link">
          Check-in ngay →
        </span>
      </RouterLink>

      <RouterLink
        to="/achievements"
        class="home-feature-card"
      >
        <span class="feature-number">04</span>

        <h3>
          Thành tựu
        </h3>

        <p>
          Mở khóa huy hiệu khi hoàn thành các cột mốc khám phá.
        </p>

        <span class="feature-link">
          Xem thành tựu →
        </span>
      </RouterLink>
    </div>
  </section>
</template>