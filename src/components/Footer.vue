<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="about">
          <h3>关于博客</h3>
          <p>掘金博客，主要记录学习技术和分享技术</p>
        </div>

        <div class="social">
          <h3>社交媒体</h3>
          <div class="social-icons">
            <a href="#" title="GitHub">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.37258 0 0 5.37258 0 12C0 17.3016 3.4375 21.7344 8.20312 23.3867C8.82812 23.4805 9.02344 23.1133 9.02344 22.7812C9.02344 22.4609 9.01562 21.5273 8.98047 20.7617C6.44141 21.3633 5.80469 19.707 5.80469 19.707C5.31641 18.2773 4.625 17.9375 4.625 17.9375C3.68359 17.2695 4.67188 17.292 4.67188 17.292C5.6875 17.3789 6.25 18.3828 6.25 18.3828C7.27734 20.1914 8.87109 19.6953 9.54297 19.4375C9.64062 19.0664 9.86719 18.8086 10.0938 18.6836C7.95312 18.4219 5.60547 17.3984 5.60547 13.7695C5.60547 12.5352 6.03125 11.5508 6.66016 10.7773C6.55469 10.5195 6.19141 9.55078 6.69141 8.23047C6.69141 8.23047 7.47656 7.83984 9.00391 8.94531C9.89062 8.79297 10.8047 8.70703 11.7031 8.70312C12.5977 8.70703 13.5195 8.79297 14.4102 8.94531C15.9414 7.83984 16.7266 8.23047 16.7266 8.23047C17.2266 9.55078 16.8633 10.5195 16.7539 10.7773C17.3828 11.5508 17.8086 12.5352 17.8086 13.7695C17.8086 17.4336 15.457 18.4023 13.3008 18.6719C13.5938 18.9102 13.8789 19.4336 13.8789 20.2227C13.8789 21.4375 13.8555 22.4102 13.8555 22.7812C13.8555 23.1172 14.0469 23.4844 14.6875 23.3828C19.4492 21.7344 22.875 17.3016 22.875 12C22.875 5.37258 17.5024 0 12 0Z" fill="currentColor"/>
              </svg>
            </a>
            <a href="#" title="掘金">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.3548 3.00005L15.1211 11.6667L24 11.6667L19.3548 3.00005Z" fill="currentColor"/>
                <path d="M9.70967 11.6667L0 11.6667L4.64516 3.00005L9.70967 11.6667Z" fill="currentColor"/>
                <path d="M12 21L0 7.5L4.64516 3.00005L16.3548 15.0001L19.3548 3.00005L24 7.5L12 21Z" fill="currentColor"/>
              </svg>
            </a>
            <a href="#" title="Twitter">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.9534 4.57a10 10 0 01-2.8257.775 4.9584 4.9584 0 002.163-2.723c-.9516.555-2.0057.959-3.1277 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" fill="currentColor"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div class="copyright">
        <p>&copy; {{ currentYear }} 我的个人博客. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const currentYear = ref(new Date().getFullYear());
</script>

<style scoped>
.footer {
  background-color: #333;
  color: white;
  padding: 3rem 0;
  margin-top: 3rem;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.about h3,
.links h3,
.social h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #667eea;
}

.about p {
  line-height: 1.6;
  color: #ccc;
}

.links ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.links li {
  margin-bottom: 0.5rem;
}

.links a {
  color: #ccc;
  text-decoration: none;
  transition: color 0.3s;
}

.links a:hover {
  color: #667eea;
}

.social-icons {
  display: flex;
  gap: 1rem;
}

.social-icons a {
  color: #ccc;
  transition: color 0.3s;
}

.social-icons a:hover {
  color: #667eea;
}

.copyright {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #444;
  color: #ccc;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .social-icons {
    justify-content: center;
  }
}
</style>