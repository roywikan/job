"use client"

import type React from "react"

import { useState } from "react"
import { PlusCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResumePreview } from "@/components/resume-preview"
import type { Dictionary } from "@/lib/i18n"

type WorkExperience = {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
  achievements: string
}

type Education = {
  id: string
  institution: string
  degree: string
  field: string
  graduationDate: string
  description: string
}

type FormData = {
  personalInfo: {
    name: string
    email: string
    phone: string
    location: string
    linkedin: string
  }
  summary: string
  workExperience: WorkExperience[]
  education: Education[]
  skills: string
}

export function ResumeForm({ dict }: { dict: Dictionary }) {
  const t = dict.form
  const [activeTab, setActiveTab] = useState("form")
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
    },
    summary: "",
    workExperience: [
      {
        id: "exp-1",
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        description: "",
        achievements: "",
      },
    ],
    education: [
      {
        id: "edu-1",
        institution: "",
        degree: "",
        field: "",
        graduationDate: "",
        description: "",
      },
    ],
    skills: "",
  })

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      personalInfo: {
        ...formData.personalInfo,
        [name]: value,
      },
    })
  }

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      summary: e.target.value,
    })
  }

  const handleWorkExperienceChange = (id: string, field: keyof WorkExperience, value: string) => {
    setFormData({
      ...formData,
      workExperience: formData.workExperience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    })
  }

  const handleEducationChange = (id: string, field: keyof Education, value: string) => {
    setFormData({
      ...formData,
      education: formData.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    })
  }

  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      skills: e.target.value,
    })
  }

  const addWorkExperience = () => {
    const newId = `exp-${formData.workExperience.length + 1}`
    setFormData({
      ...formData,
      workExperience: [
        ...formData.workExperience,
        {
          id: newId,
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          description: "",
          achievements: "",
        },
      ],
    })
  }

  const removeWorkExperience = (id: string) => {
    if (formData.workExperience.length > 1) {
      setFormData({
        ...formData,
        workExperience: formData.workExperience.filter((exp) => exp.id !== id),
      })
    }
  }

  const addEducation = () => {
    const newId = `edu-${formData.education.length + 1}`
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        {
          id: newId,
          institution: "",
          degree: "",
          field: "",
          graduationDate: "",
          description: "",
        },
      ],
    })
  }

  const removeEducation = (id: string) => {
    if (formData.education.length > 1) {
      setFormData({
        ...formData,
        education: formData.education.filter((edu) => edu.id !== id),
      })
    }
  }

  const generateResume = () => {
    setActiveTab("preview")
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="form">{t.tabForm}</TabsTrigger>
          <TabsTrigger value="preview">{t.tabPreview}</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <div className="space-y-8">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">{t.personalInfo}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.fullName}</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.personalInfo.name}
                      onChange={handlePersonalInfoChange}
                      placeholder={t.namePlaceholder}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.email}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.personalInfo.email}
                      onChange={handlePersonalInfoChange}
                      placeholder={t.emailPlaceholder}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t.phone}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.personalInfo.phone}
                      onChange={handlePersonalInfoChange}
                      placeholder={t.phonePlaceholder}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">{t.location}</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.personalInfo.location}
                      onChange={handlePersonalInfoChange}
                      placeholder={t.locationPlaceholder}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="linkedin">{t.linkedin}</Label>
                    <Input
                      id="linkedin"
                      name="linkedin"
                      value={formData.personalInfo.linkedin}
                      onChange={handlePersonalInfoChange}
                      placeholder={t.linkedinPlaceholder}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">{t.summaryTitle}</h2>
                <div className="space-y-2">
                  <Label htmlFor="summary">{t.summaryLabel}</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={handleSummaryChange}
                    placeholder={t.summaryPlaceholder}
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-muted-foreground">{t.summaryTip}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{t.workTitle}</h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addWorkExperience}
                    className="flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    {t.addExperience}
                  </Button>
                </div>

                {formData.workExperience.map((experience, index) => (
                  <div key={experience.id} className="mb-6 pb-6 border-b last:border-b-0 last:pb-0 last:mb-0">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">{t.experience} {index + 1}</h3>
                      {formData.workExperience.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWorkExperience(experience.id)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t.remove}
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`company-${experience.id}`}>{t.company}</Label>
                        <Input
                          id={`company-${experience.id}`}
                          value={experience.company}
                          onChange={(e) => handleWorkExperienceChange(experience.id, "company", e.target.value)}
                          placeholder={t.companyPlaceholder}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`position-${experience.id}`}>{t.position}</Label>
                        <Input
                          id={`position-${experience.id}`}
                          value={experience.position}
                          onChange={(e) => handleWorkExperienceChange(experience.id, "position", e.target.value)}
                          placeholder={t.positionPlaceholder}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`startDate-${experience.id}`}>{t.startDate}</Label>
                        <Input
                          id={`startDate-${experience.id}`}
                          value={experience.startDate}
                          onChange={(e) => handleWorkExperienceChange(experience.id, "startDate", e.target.value)}
                          placeholder={t.datePlaceholder}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`endDate-${experience.id}`}>{t.endDate}</Label>
                        <Input
                          id={`endDate-${experience.id}`}
                          value={experience.endDate}
                          onChange={(e) => handleWorkExperienceChange(experience.id, "endDate", e.target.value)}
                          placeholder={t.endDatePlaceholder}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`description-${experience.id}`}>{t.jobDescription}</Label>
                        <Textarea
                          id={`description-${experience.id}`}
                          value={experience.description}
                          onChange={(e) => handleWorkExperienceChange(experience.id, "description", e.target.value)}
                          placeholder={t.jobDescriptionPlaceholder}
                          className="min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`achievements-${experience.id}`}>{t.achievements}</Label>
                        <Textarea
                          id={`achievements-${experience.id}`}
                          value={experience.achievements}
                          onChange={(e) => handleWorkExperienceChange(experience.id, "achievements", e.target.value)}
                          placeholder={t.achievementsPlaceholder}
                          className="min-h-[100px]"
                        />
                        <p className="text-sm text-muted-foreground">{t.achievementsTip}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{t.educationTitle}</h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEducation}
                    className="flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    {t.addEducation}
                  </Button>
                </div>

                {formData.education.map((education, index) => (
                  <div key={education.id} className="mb-6 pb-6 border-b last:border-b-0 last:pb-0 last:mb-0">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">{t.educationItem} {index + 1}</h3>
                      {formData.education.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(education.id)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t.remove}
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`institution-${education.id}`}>{t.institution}</Label>
                        <Input
                          id={`institution-${education.id}`}
                          value={education.institution}
                          onChange={(e) => handleEducationChange(education.id, "institution", e.target.value)}
                          placeholder={t.institutionPlaceholder}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`degree-${education.id}`}>{t.degree}</Label>
                        <Input
                          id={`degree-${education.id}`}
                          value={education.degree}
                          onChange={(e) => handleEducationChange(education.id, "degree", e.target.value)}
                          placeholder={t.degreePlaceholder}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`field-${education.id}`}>{t.field}</Label>
                        <Input
                          id={`field-${education.id}`}
                          value={education.field}
                          onChange={(e) => handleEducationChange(education.id, "field", e.target.value)}
                          placeholder={t.fieldPlaceholder}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`graduationDate-${education.id}`}>{t.graduationDate}</Label>
                        <Input
                          id={`graduationDate-${education.id}`}
                          value={education.graduationDate}
                          onChange={(e) => handleEducationChange(education.id, "graduationDate", e.target.value)}
                          placeholder={t.datePlaceholder}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`description-${education.id}`}>{t.additionalInfo}</Label>
                        <Textarea
                          id={`description-${education.id}`}
                          value={education.description}
                          onChange={(e) => handleEducationChange(education.id, "description", e.target.value)}
                          placeholder={t.additionalInfoPlaceholder}
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">{t.skillsTitle}</h2>
                <div className="space-y-2">
                  <Label htmlFor="skills">{t.skillsLabel}</Label>
                  <Textarea
                    id="skills"
                    value={formData.skills}
                    onChange={handleSkillsChange}
                    placeholder={t.skillsPlaceholder}
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-muted-foreground">{t.skillsTip}</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button size="lg" onClick={generateResume} className="px-8">
                {t.generate}
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="preview">
          <ResumePreview formData={formData} dict={dict.preview} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
