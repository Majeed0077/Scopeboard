import { contacts } from "@/data/contacts";
import { invoices } from "@/data/invoices";
import { milestones } from "@/data/milestones";
import { projects } from "@/data/projects";
import type { Contact, Invoice, Milestone, Project } from "@/types";
import { api } from "@/lib/api";

export interface DataProvider {
  getContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  getMilestones(): Promise<Milestone[]>;
  getMilestonesByProject(projectId: string): Promise<Milestone[]>;
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
}

// Retained for explicit mock endpoints only. App pages should use `dataProvider`.
class LocalDataProvider implements DataProvider {
  async getContacts() {
    return contacts;
  }

  async getContact(id: string) {
    return contacts.find((contact) => contact.id === id);
  }

  async getProjects() {
    return projects;
  }

  async getProject(id: string) {
    return projects.find((project) => project.id === id);
  }

  async getMilestones() {
    return milestones;
  }

  async getMilestonesByProject(projectId: string) {
    return milestones.filter((milestone) => milestone.projectId === projectId);
  }

  async getInvoices() {
    return invoices;
  }

  async getInvoice(id: string) {
    return invoices.find((invoice) => invoice.id === id);
  }
}

class ApiDataProvider implements DataProvider {
  async getContacts() {
    return api.getContacts();
  }

  async getContact(id: string) {
    const data = await api.getContacts();
    return data.find((item) => item.id === id);
  }

  async getProjects() {
    return api.getProjects();
  }

  async getProject(id: string) {
    const data = await api.getProjects();
    return data.find((item) => item.id === id);
  }

  async getMilestones() {
    return api.getMilestones();
  }

  async getMilestonesByProject(projectId: string) {
    const data = await api.getMilestones();
    return data.filter((item) => item.projectId === projectId);
  }

  async getInvoices() {
    return api.getInvoices();
  }

  async getInvoice(id: string) {
    const data = await api.getInvoices();
    return data.find((item) => item.id === id);
  }
}

export const localDataProvider: DataProvider = new LocalDataProvider();
export const dataProvider: DataProvider = new ApiDataProvider();
