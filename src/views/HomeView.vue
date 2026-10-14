<script setup>
import '../assets/styles/home.css'

import AppHeader from '../components/layout/AppHeader.vue'
import AppFooter from '../components/layout/AppFooter.vue'

import HeroSection from '../components/home/HeroSection.vue'
import HomeFeatures from '../components/home/HomeFeatures.vue'
import FeaturedJourney from '../components/home/FeaturedJourney.vue'
</script>

<template>
  <div class="page-layout">
    <AppHeader />

    <main class="page-content">
      <HeroSection />

      <HomeFeatures />

      <FeaturedJourney />

      <!-- Trải nghiệm ECOVEL -->
      <section class="experience-section">
        <div class="experience-container">
          <div class="experience-heading">
            <span class="home-tag">
              TRẢI NGHIỆM ECOVEL
            </span>

            <h2>
              Một hành trình,
              <br />
              ba bước khám phá
            </h2>

            <p>
              Chọn hành trình, check-in tại điểm đến
              và lưu lại từng dấu ấn trên hành trình
              khám phá di sản của bạn.
            </p>
          </div>

          <div class="experience-steps">
            <article class="experience-step">
              <div class="experience-step-number">
                01
              </div>

              <div class="experience-step-content">
                <span class="experience-icon">
                  🧭
                </span>

                <h3>
                  Chọn hành trình
                </h3>

                <p>
                  Lựa chọn chủ đề phù hợp và khám phá
                  những điểm đến văn hóa, di sản nổi bật.
                </p>

                <RouterLink
                  to="/journeys"
                  class="experience-link"
                >
                  Xem hành trình →
                </RouterLink>
              </div>
            </article>

            <div class="experience-line"></div>

            <article class="experience-step">
              <div class="experience-step-number">
                02
              </div>

              <div class="experience-step-content">
                <span class="experience-icon">
                  📍
                </span>

                <h3>
                  Check-in điểm đến
                </h3>

                <p>
                  Xác nhận vị trí tại địa điểm và lưu lại
                  những nơi bạn đã đặt chân đến.
                </p>

                <RouterLink
                  to="/checkin"
                  class="experience-link"
                >
                  Check-in ngay →
                </RouterLink>
              </div>
            </article>

            <div class="experience-line"></div>

            <article class="experience-step">
              <div class="experience-step-number">
                03
              </div>

              <div class="experience-step-content">
                <span class="experience-icon">
                  🏅
                </span>

                <h3>
                  Ghi dấu thành tựu
                </h3>

                <p>
                  Hoàn thành cột mốc, mở khóa huy hiệu
                  và theo dõi tiến trình khám phá của bạn.
                </p>

                <RouterLink
                  to="/achievements"
                  class="experience-link"
                >
                  Xem thành tựu →
                </RouterLink>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- Câu chuyện ECOVEL -->
      <section class="story-section">
        <div class="story-container">
          <div class="story-visual">
            <img
              src="/images/Nha_tho_Duc_Ba.jpg"
              alt="Nhà thờ Đức Bà"
            />

            <div class="story-caption">
              <span>01</span>

              <p>
                Di sản không chỉ để ngắm nhìn,
                mà còn để trải nghiệm và ghi nhớ.
              </p>
            </div>
          </div>

          <div class="story-content">
            <span class="home-tag">
              CÂU CHUYỆN ECOVEL
            </span>

            <h2>
              Mỗi chuyến đi
              <br />
              là một câu chuyện
            </h2>

            <p class="story-lead">
              ECOVEL kết nối hành trình du lịch
              với những giá trị văn hóa và di sản Việt Nam.
            </p>

            <p>
              Bạn không chỉ ghé thăm một địa điểm,
              mà còn có thể lưu lại những nơi đã khám phá,
              theo dõi tiến trình và xây dựng hộ chiếu
              du lịch của riêng mình.
            </p>

            <p>
              Mỗi lần check-in là một dấu ấn.
              Mỗi hành trình hoàn thành là một câu chuyện
              được lưu lại cùng ECOVEL.
            </p>

            <RouterLink
              to="/about"
              class="story-link"
            >
              Tìm hiểu về ECOVEL
              <span>→</span>
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="home-final-cta">
        <div class="final-cta-content">
          <span class="home-tag light">
            BẮT ĐẦU HÀNH TRÌNH
          </span>

          <h2>
            Điểm đến tiếp theo
            <br />
            đang chờ bạn
          </h2>

          <p>
            Chọn một hành trình mới,
            khám phá những điểm đến thú vị
            và tạo nên dấu ấn ECOVEL của riêng bạn.
          </p>

          <div class="final-cta-actions">
            <RouterLink
              to="/journeys"
              class="final-primary"
            >
              Bắt đầu khám phá
            </RouterLink>

            <RouterLink
              to="/map"
              class="final-secondary"
            >
              Xem bản đồ
            </RouterLink>
          </div>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>