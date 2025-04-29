import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from '../services/reviews.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'The review has been successfully created.' })
  create(@Body() createReviewDto: any, @Request() req) {
    return this.reviewsService.create({
      ...createReviewDto,
      userId: req.user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiResponse({ status: 200, description: 'Return all reviews.' })
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a review by id' })
  @ApiResponse({ status: 200, description: 'Return the review.' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Get('service/:serviceId')
  @ApiOperation({ summary: 'Get reviews by service id' })
  @ApiResponse({ status: 200, description: 'Return the service\'s reviews.' })
  findByService(@Param('serviceId') serviceId: string) {
    return this.reviewsService.findByService(serviceId);
  }

  @Get('user/me')
  @ApiOperation({ summary: 'Get current user\'s reviews' })
  @ApiResponse({ status: 200, description: 'Return the current user\'s reviews.' })
  findMyReviews(@Request() req) {
    return this.reviewsService.findByUser(req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({ status: 200, description: 'The review has been successfully updated.' })
  update(@Param('id') id: string, @Body() updateReviewDto: any, @Request() req) {
    return this.reviewsService.update(id, updateReviewDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'The review has been successfully deleted.' })
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(id, req.user.id);
  }
} 