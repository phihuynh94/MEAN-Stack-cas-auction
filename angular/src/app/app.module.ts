// built in library
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Routes } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// components
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { UserComponent } from './components/user/user.component';
import { SignUpComponent } from './components/user/sign-up/sign-up.component';
import { SignInComponent } from './components/user/sign-in/sign-in.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserService } from './components/user/service/user.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthInterceptor } from './auth/auth.interceptor';
import { AdminComponent } from './components/admin/admin.component';
import { CreateAuctionComponent } from './components/admin/create-auction/create-auction.component';
import { AuctionsComponent } from './components/auctions/auctions.component';
import { AuctionsListComponent } from './components/auctions-list/auctions-list.component';
import { AddItemComponent } from './components/auctions/add-item/add-item.component';
import { CartComponent } from './components/dashboard/cart/cart.component';
import { ItemListComponent } from './components/auctions/item-list/item-list.component';
import { AuctionEditComponent } from './components/auctions/auction-edit/auction-edit.component';
import { AddStaffComponent } from './components/admin/add-staff/add-staff.component';
import { ParticipantsListComponent } from './components/auctions/participants-list/participants-list.component';
import { LiveAuctionComponent } from './components/auctions/live-auction/live-auction.component';
import { CheckOutComponent } from './components/dashboard/cart/check-out/check-out.component';
import { UserProfileComponent } from './components/user/user-profile/user-profile.component';
import { ForgotPasswordComponent } from './components/user/forgot-password/forgot-password.component';
import { SellerItemsListComponent } from './components/auctions/seller-items-list/seller-items-list.component';
import { ItemPageComponent } from './components/auctions/item-page/item-page.component';
import { QuickSellComponent } from './components/admin/quick-sell/quick-sell.component';
import { ResetPasswordComponent } from './components/user/reset-password/reset-password.component';
import { ViewUsersComponent } from './components/admin/view-users/view-users.component';
import { AddMemberComponent } from './components/admin/add-member/add-member.component';

// routes
const appRoutes: Routes = [
  { 
    path: '', component: HomeComponent 
  },
  // url: 'user/
  { 
    path: 'user', redirectTo: '/user/signin', pathMatch: 'full' 
  },
  // url: 'user/signup'
  { 
    path: 'user', component: UserComponent,
    children: [{ path: 'signup', component: SignUpComponent }] 
  },
  // url: 'user/signin'
  {
    path: 'user', component: UserComponent,
    children: [{ path: 'signin', component: SignInComponent }]
  },
  // url: 'user/forgotPassword'
  {
    path: 'user', component: UserComponent,
    children: [{ path: 'forgotPassword', component: ForgotPasswordComponent }]
  },
  {
    path: 'user', component: UserComponent,
    children: [{ path: 'resetPassword/:token', component: ResetPasswordComponent }]
  },
  // url: 'user-profile'
  {
    path: 'user-profile', component: UserProfileComponent,
  },
  // url: 'dashboard'
  { 
    path: 'dashboard', component: DashboardComponent,
    canActivate:[AuthGuard] 
  },
  // url: 'administration'
  { 
    path: 'admin', component: AdminComponent 
  },
  // url: 'auctions
  {
    path: 'auctions/:id', component: AuctionsComponent
  },
  // url: 'editAuction'
  {
    path: 'editAuction/:id', component: AuctionEditComponent
  },
  // url: 'live'
  {
    path: 'live/:id', component: LiveAuctionComponent
  },
  // url: 'cart'
  {
    path: 'cart', component: CartComponent
  },
  // url: 'check-out'
  {
    path: 'checkout', component: CheckOutComponent
  },
  // url: 'item-page'
  {
    path: 'itemPage/:id', component: ItemPageComponent
  },
  // url: 'view-users'
  {
    path: 'viewUsers', component: ViewUsersComponent
  }
]

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    UserComponent,
    SignUpComponent,
    SignInComponent,
    DashboardComponent,
    AdminComponent,
    CreateAuctionComponent,
    AuctionsComponent,
    AuctionsListComponent,
    AddItemComponent,
    CartComponent,
    ItemListComponent,
    AuctionEditComponent,
    AddStaffComponent,
    ParticipantsListComponent,
    LiveAuctionComponent,
    CheckOutComponent,
    UserProfileComponent,
    ForgotPasswordComponent,
    SellerItemsListComponent,
    ItemPageComponent,
    QuickSellComponent,
    ResetPasswordComponent,
    ViewUsersComponent,
    AddMemberComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
    HttpClientModule
  ],
  providers: [
    {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
    },
    AuthGuard,
    UserService],
  bootstrap: [AppComponent]
})
export class AppModule { }