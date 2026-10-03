"use client";

import React, { ReactNode } from "react";
import Image from "next/image";
import {
  MessageCircle,
  Heart,
  Users,
  Lock,
  Zap,
  ShieldCheck,
  Globe2,
} from "lucide-react";
import ChatSetupForm from "@/components/home/ChatSetupForm";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Props interface for FeatureItem
interface FeatureItemProps {
  icon: ReactNode;
  iconClass: string;
  title: string;
  description: string;
}

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#eef3f9] text-slate-900 antialiased">
      {/* HEADER */}
      <Header />

      {/* MAIN */}
      <main className="relative z-10 w-full flex-1 pt-1 sm:pt-4 lg:pt-10">
        {/* HERO SECTION */}
        <section className="relative mx-auto w-full pb-6 max-w-[1440px] overflow-hidden bg-[#eef3f9]">
          {/* MOBILE / TABLET IMAGE */}
          <div className="relative block h-[200px] w-full sm:h-[300px] lg:hidden">
            <Image
              src="/hero-bg-woman.png"
              alt="VChatz"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center sm:object-[58%_center]"
            />
            {/* Soft Overlay */}
            {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#eef3f9]" /> */}
          </div>

          {/* DESKTOP BACKGROUND IMAGE */}
          <div className="absolute inset-0 hidden lg:block">
            <Image
              src="/hero-bg-woman.png"
              alt="VChatz Background Woman"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[55%_top]"
            />
            {/* Desktop Soft Overlay */}
            {/* <div className="absolute inset-0 bg-gradient-to-r from-[#eef3f9]/95 via-[#eef3f9]/35 to-transparent" /> */}
          </div>

          {/* FLOATING MALE USER CARD */}
          <div className="pointer-events-none absolute z-20 hidden sm:right-5 sm:top-[55px] sm:block md:right-[8%] md:top-[65px] lg:left-[55%] lg:right-auto lg:top-[70px]">
            {/* Reduced width/height classes below */}
            <div className="relative h-[80px] w-[90px] overflow-hidden rounded-[14px] border-[2px] border-white bg-white shadow-[0_10px_20px_rgba(0,0,0,0.12)] md:h-[95px] md:w-[105px] lg:h-[105px] lg:w-[115px] xl:h-[115px] xl:w-[125px]">
              {/* ONLINE DOT */}
              <span className="absolute left-1.5 top-1.5 z-30 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#10b981] shadow-sm" />

              <Image
                src="/male-user-preview.png"
                alt="VChatz Male User"
                fill
                sizes="125px"
                className="object-cover object-top"
              />
            </div>
          </div>

          {/* HERO CONTENT */}
          <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-8 sm:px-6 sm:pb-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-6 lg:px-8 lg:py-16 xl:px-10">
            {/* LEFT CONTENT */}
            <section className="flex w-full flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
              {/* ONLINE BADGE */}
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-md sm:mb-4 sm:px-4 lg:mb-3">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#10b981]" />
                <span className="text-[11px] font-bold text-[#10b981] sm:text-sm">
                  1,240+ Users Online
                </span>
              </div>

              {/* HEADING */}
              <h1 className="max-w-[300px] text-[26px] font-black leading-[1.08] tracking-tight text-[#0f172a] sm:max-w-[450px] sm:text-[34px] md:text-[38px] lg:max-w-[520px] lg:text-[36px] xl:text-[44px]">
                Connect Instantly
                <br />
                <span className="text-[#2563eb]">With People</span>
                <br />
                <span className="text-[#2563eb]">Worldwide</span>
              </h1>

              {/* DESCRIPTION */}
              <p className="mt-3 max-w-[330px] text-[13px] font-medium leading-[1.5] text-slate-700 sm:max-w-[470px] sm:text-[15px] lg:max-w-[430px] lg:text-[14px] xl:text-[15px]">
                Meet new friends, have live text chats, or start random video
                calls safely in seconds.
              </p>

              {/* FEATURE ICONS */}
              <div className="mt-5 flex w-full items-start justify-center gap-8 sm:mt-6 sm:gap-12 lg:justify-start lg:gap-8">
                {/* CHAT */}
                <div className="flex shrink-0 flex-col items-center gap-1.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100/50 bg-white/95 text-blue-600 shadow-md sm:h-11 sm:w-11">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-900 sm:text-[11px]">
                    Chat
                  </span>
                </div>

                {/* CONNECT */}
                <div className="flex shrink-0 flex-col items-center gap-1.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100/50 bg-white/95 text-orange-500 shadow-md sm:h-11 sm:w-11">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-900 sm:text-[11px]">
                    Connect
                  </span>
                </div>

                {/* FUN */}
                <div className="flex shrink-0 flex-col items-center gap-1.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100/50 bg-white/95 text-indigo-600 shadow-md sm:h-11 sm:w-11">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-900 sm:text-[11px]">
                    Have Fun
                  </span>
                </div>
              </div>
            </section>

            {/* CHAT SETUP CARD */}
            <section className="mt-5 flex w-full justify-center sm:mt-6 md:mt-7 lg:col-span-5 lg:mt-0 lg:justify-end">
              <div className="w-full max-w-[360px] rounded-[18px] border border-white/80 bg-white/95 p-4 shadow-[0_15px_35px_rgba(15,23,42,0.08)] backdrop-blur-md sm:p-[18px] lg:max-w-[330px] xl:max-w-[350px]">
                {/* CARD TITLE */}
                <h2 className="text-[18px] font-black leading-tight tracking-tight text-[#0f172a] sm:text-[19px]">
                  Start Chatting Now
                </h2>

                {/* CARD DESCRIPTION */}
                <p className="mt-1 text-[10px] font-medium leading-[1.4] text-slate-400 sm:text-[11px]">
                  Choose your gender preference and start instantly.
                </p>

                {/* FORM */}
                <div className="mt-3 sm:mt-4">
                  <ChatSetupForm />
                </div>
              </div>
            </section>
          </div>

          {/* BOTTOM FEATURES */}
          <div className="mx-auto mt-4 w-full max-w-7xl px-4 sm:mt-8 sm:px-6 lg:mt-10 lg:px-8 banner-down-se">
            <div className="rounded-[24px] border border-white bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.03)] sm:rounded-[26px] sm:p-4">
              <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                <FeatureItem
                  icon={<Lock className="h-5 w-5" />}
                  iconClass="bg-blue-50 text-blue-600"
                  title="End-to-End Private"
                  description="Your conversations are 100% private and secure."
                />
                <FeatureItem
                  icon={<Zap className="h-5 w-5" />}
                  iconClass="bg-orange-50 text-orange-500"
                  title="Instant Matching"
                  description="Get connected instantly with random people."
                />
                <FeatureItem
                  icon={<ShieldCheck className="h-5 w-5" />}
                  iconClass="bg-emerald-50 text-emerald-600"
                  title="Safe Community"
                  description="We keep our community friendly and safe for everyone."
                />
                <FeatureItem
                  icon={<Globe2 className="h-5 w-5" />}
                  iconClass="bg-purple-50 text-purple-600"
                  title="Global Connections"
                  description="Meet people from around the world."
                />
              </div>
            </div>
          </div>
          
          
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

/* FEATURE ITEM COMPONENT */
function FeatureItem({ icon, iconClass, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-3 sm:px-4 sm:py-4 lg:px-4 lg:py-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconClass} sm:h-11 sm:w-11`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <h3 className="text-[12px] font-extrabold text-slate-900">{title}</h3>
        <p className="mt-0.5 text-[10px] font-medium leading-[1.35] text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}