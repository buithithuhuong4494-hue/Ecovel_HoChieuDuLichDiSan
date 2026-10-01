<template>
  <section class="featured-journey">
    <div class="home-section-heading">
      <span class="home-tag">
        HÀNH TRÌNH NỔI BẬT
      </span>

      <h2>
        Chọn hành trình bạn muốn khám phá
      </h2>

      <p>
        Mỗi hành trình kết nối nhiều điểm đến
        theo một chủ đề văn hóa và di sản riêng.
      </p>
    </div>

    <div class="featured-journey-card">
      <div class="featured-journey-image">
        <img
          src="/images/Dinh_Doc_Lap.jpg"
          alt="Hành trình Di sản Sài Gòn"
        />
      </div>

      <div class="featured-journey-content">
        <div class="featured-journey-top">
          <span class="journey-badge-new">
            HÀNH TRÌNH
          </span>

          <span class="journey-count-new">
            3 điểm đến
          </span>
        </div>

        <h3>
          Hành trình Di sản Sài Gòn
        </h3>

        <p class="featured-description">
          Khám phá những địa điểm di sản nổi bật
          tại trung tâm TP.HCM và lưu lại dấu ấn
          trên hành trình ECOVEL của bạn.
        </p>

        <div class="featured-location-list">
          <span>Nhà thờ Đức Bà</span>
          <span>Chợ Bến Thành</span>
          <span>Dinh Độc Lập</span>
        </div>

        <RouterLink
          to="/journeys/1"
          class="featured-journey-button"
        >
          Khám phá hành trình →
        </RouterLink>
      </div>
    </div>
  </section>
</template>