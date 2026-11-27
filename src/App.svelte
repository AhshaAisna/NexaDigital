<script>
  import { activeView, navigateTo, showToast } from './stores/marketplaceStore';
  import { isClientLoggedIn, isAdminLoggedIn } from './stores/authStore';
  import Navbar from './components/Navbar.svelte';
  import Footer from './components/Footer.svelte';
  import Toast from './components/Toast.svelte';

  import HomeView from './views/HomeView.svelte';
  import ServicesView from './views/ServicesView.svelte';
  import ServiceDetailView from './views/ServiceDetailView.svelte';
  import PortfolioView from './views/PortfolioView.svelte';
  import CaseStudyModal from './views/CaseStudyModal.svelte';
  import AboutView from './views/AboutView.svelte';
  import ContactView from './views/ContactView.svelte';
  import CheckoutView from './views/CheckoutView.svelte';
  import InvoiceView from './views/InvoiceView.svelte';
  import ProjectTrackerView from './views/ProjectTrackerView.svelte';
  import CustomerDashboardView from './views/CustomerDashboardView.svelte';
  import AdminDashboardView from './views/AdminDashboardView.svelte';
  import LoginView from './views/LoginView.svelte';
  import ClientLoginView from './views/ClientLoginView.svelte';
  import AdminLoginView from './views/AdminLoginView.svelte';
  import PegawaiDashboardView from './views/PegawaiDashboardView.svelte';
  import PegawaiLoginView from './views/PegawaiLoginView.svelte';
  import { isPegawaiLoggedIn } from './stores/authStore';

  // Strict Security Navigation Guards:
  // 1. Akun Klien TIDAK BISA membuka admin-dashboard, admin-login, pegawai-dashboard, pegawai-login
  $: if ($isClientLoggedIn && ($activeView === 'admin-login' || $activeView === 'admin-dashboard' || $activeView === 'pegawai-login' || $activeView === 'pegawai-dashboard')) {
    showToast('Akses Ditolak: Anda sedang masuk sebagai Klien. Logout terlebih dahulu untuk membuka Portal Staf/Admin.', 'error');
    navigateTo('customer-dashboard');
  }

  // 2. Akun Pegawai TIDAK BISA membuka admin-dashboard maupun admin-login (hanya mengelola via Pegawai Dashboard)
  $: if ($isPegawaiLoggedIn && ($activeView === 'admin-login' || $activeView === 'admin-dashboard')) {
    showToast('Akses Ditolak: Anda login sebagai Pegawai. Silakan kelola projek & invoice melalui Dashboard Pegawai.', 'error');
    navigateTo('pegawai-dashboard');
  }
</script>

<!-- Mengubah pembungkus utama menjadi h-screen flex flex-col dengan overflow-y-auto pada kontainer konten -->
<div class="h-screen flex flex-col bg-white text-slate-800 font-sans selection:bg-brand-600 selection:text-white overflow-hidden">
  
  <!-- Global Navbar (Hidden during login, admin dashboard, customer dashboard, and pegawai dashboard) -->
  {#if $activeView !== 'login' && $activeView !== 'admin-login' && $activeView !== 'admin-dashboard' && $activeView !== 'customer-dashboard' && $activeView !== 'pegawai-dashboard' && $activeView !== 'pegawai-login'}
    <div class="no-print shrink-0 z-50">
      <Navbar />
    </div>
  {/if}

  <!-- Main View Router Container (Area yang bisa di-scroll secara mandiri) -->
  <main class="flex-1 overflow-y-auto">
    {#if $activeView === 'home'}
      <HomeView />
    {:else if $activeView === 'services'}
      <ServicesView />
    {:else if $activeView === 'service-detail'}
      <ServiceDetailView />
    {:else if $activeView === 'portfolio'}
      <PortfolioView />
    {:else if $activeView === 'about'}
      <AboutView />
    {:else if $activeView === 'contact'}
      <ContactView />
    {:else if $activeView === 'checkout'}
      <CheckoutView />
    {:else if $activeView === 'invoice'}
      <InvoiceView />
    {:else if $activeView === 'project-tracker'}
      <ProjectTrackerView />
    {:else if $activeView === 'customer-dashboard'}
      <CustomerDashboardView />
    {:else if $activeView === 'admin-dashboard'}
      <AdminDashboardView />
    {:else if $activeView === 'login'}
      <LoginView />
    {:else if $activeView === 'client-login'}
      <LoginView />
    {:else if $activeView === 'admin-login'}
      <LoginView />
    {:else if $activeView === 'pegawai-dashboard'}
      <PegawaiDashboardView />
    {:else if $activeView === 'pegawai-login'}
      <LoginView />
    {:else}
      <HomeView />
    {/if}

    <!-- Global Footer (Hidden on dashboard views and login screens) -->
    {#if $activeView !== 'login' && $activeView !== 'admin-login' && $activeView !== 'admin-dashboard' && $activeView !== 'customer-dashboard' && $activeView !== 'pegawai-dashboard' && $activeView !== 'pegawai-login'}
      <div class="no-print">
        <Footer />
      </div>
    {/if}
  </main>

  <!-- Global Toast Feedback -->
  <Toast />

  <!-- Case Study Modal -->
  <CaseStudyModal />

</div>