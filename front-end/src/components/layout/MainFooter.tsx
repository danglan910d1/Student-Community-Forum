"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import {
  FileText,
  Tag,
  Hash,
  Github,
  Mail,
  Users,
  UserCircle,
  LayoutDashboard,
} from "lucide-react";
import { FooterLink } from "../shared/FooterLink";
import { usePathname } from "next/navigation";

export function MainFooter() {
  const currentYear = new Date().getFullYear();

  const teamMembers = [
    {
      name: "Đặng Thị Ngọc Lan",
      mssv: "24004429",
      profileId: "691ee87e6a33ec17edb4170b",
      role: "Project Leader, Fullstack Developer & Lead Designer",
      isLeader: true,
    },
    {
      name: "Phạm Hoàng Bảo Ngọc",
      mssv: "24003845",
      profileId: "6961fb07fa7b1d6a4f723209",
      role: "Business Analyst, System Architect & QA Tester",
      isLeader: false,
    },
  ];

  return (
    <footer className="border-t-4 border-blue-600 bg-slate-900 py-12 text-slate-400 z-30 relative shrink-0 font-sans">
      <div className="mx-auto max-w-[1600px] px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* CỘT 1: ĐỘI NGŨ PHÁT TRIỂN */}
          <div className="flex flex-col gap-6">
            <Logo />
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-sm uppercase tracking-widest text-slate-200">
                <Users size={16} className="text-blue-500" /> Thành viên nhóm
              </h4>

              <ul className="space-y-5 text-sm">
                {teamMembers.map((member) => (
                  <li key={member.mssv} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile/${member.profileId}`}
                        className="text-slate-100 font-semibold hover:text-blue-400 transition-colors"
                      >
                        {member.name}
                      </Link>
                      {member.isLeader && (
                        <span className="text-[9px] bg-blue-600/20 text-blue-400 border border-blue-600/30 px-1.5 py-0.5 rounded-full uppercase font-bold">
                          Leader
                        </span>
                      )}
                    </div>
                    <code className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-blue-400 font-mono border border-slate-700 w-fit">
                      {member.mssv}
                    </code>
                    <span className="text-[11px] text-slate-500 max-w-[250px]">
                      {member.role}
                    </span>
                  </li>
                ))}
              </ul>
              <FooterLink href="/about" icon={Users}>
                Về chúng tôi
              </FooterLink>
            </div>
          </div>

          {/* CỘT 2: CÁ NHÂN */}
          <div className="space-y-6">
            <h4 className="text-sm uppercase tracking-widest text-slate-200 border-l-2 border-blue-600 pl-3">
              Cá nhân
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <FooterLink href="/dashboard/profile" icon={UserCircle}>
                  Thông tin tài khoản
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/dashboard/posts" icon={FileText}>
                  Bài viết của tôi
                </FooterLink>
              </li>
            </ul>
          </div>

          {/* CỘT 3: CỘNG ĐỒNG */}
          <div className="space-y-6">
            <h4 className="text-sm uppercase tracking-widest text-slate-200 border-l-2 border-blue-600 pl-3">
              Cộng đồng
            </h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <FooterLink href="/posts" icon={LayoutDashboard}>
                  Bảng tin công khai
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/tags" icon={Tag}>
                  Thẻ bài viết
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/topics" icon={Hash}>
                  Chủ đề thảo luận
                </FooterLink>
              </li>
            </ul>
          </div>

          {/* CỘT 4: LIÊN HỆ */}
          <div className="space-y-6">
            <h4 className="text-sm uppercase tracking-widest text-slate-200 border-l-2 border-blue-600 pl-3">
              Liên hệ
            </h4>

            <div className="flex flex-col gap-4 text-sm">
              <p className="leading-relaxed">
                Hệ thống diễn đàn dành riêng cho sinh viên học tập, nghiên cứu
                và trao đổi công nghệ.
              </p>
              <div className="flex gap-3 pt-2">
                <a
                  href="https://github.com"
                  target="_blank"
                  className="group p-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-blue-400 hover:text-white transition-all border border-slate-700"
                >
                  <Github
                    size={18}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                </a>
                <a
                  href="mailto:contact@studentforum.vn"
                  className="group p-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-blue-400 hover:text-white transition-all border border-slate-700"
                >
                  <Mail
                    size={18}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM FOOTER */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-wider text-slate-500">
          <p>
            © {currentYear} Student Community Forum. Project for Education
            Purposes.
          </p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-blue-400 transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/" className="hover:text-blue-400 transition-colors">
              Điều khoản
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
